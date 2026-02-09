import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import { config } from "../../config/config.js";
import AppError from "../../utils/AppError.js";
import { addMinutes } from "../../utils/utils.js";

const userModel = new User();

// Generate a dummy hash for timing attacks protection
// This hash will be used when the user is not found, to simulate the time taken by bcrypt.compare
const DUMMY_HASH = bcrypt.hashSync("dummy_password", config.security.bcryptRounds);

export const getUserById = async (id) => {
  const user = await userModel.withRole().find(id);
  if (!user) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return user;
};

export const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
}) => {
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new AppError("Usuario ya existe", "DUPLICATE_ENTRY", 409);
  }

  return await userModel.withRole().create({
    first_name,
    last_name,
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, config.security.bcryptRounds),
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);

  // Timing Attack Protection:
  // Always perform bcrypt comparison, even if user is not found.
  // If user is found, use their stored hash.
  // If user is not found, use the dummy hash.
  const hashToCompare = user ? user.password : DUMMY_HASH;
  const isValidPassword = await bcrypt.compare(password, hashToCompare);

  if (!user || !isValidPassword) {
    // If user exists but password was wrong, increment failed attempts
    if (user) {
      // Increment failed attempts
      const attempts = (user.failed_login_attempts || 0) + 1;
      const updates = { failed_login_attempts: attempts };

      // Lock account if max attempts reached
      if (attempts >= 4) {
        updates.locked_at = new Date();
        updates.locked_until = addMinutes(15);
      }

      await userModel.update(user.id, updates);
    }

    // Always return generic error
    throw new AppError("Credenciales inválidas", "INVALID_CREDENTIALS", 401);
  }

  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new AppError(
      "Cuenta bloqueada. Inténtalo de nuevo más tarde.",
      "ACCOUNT_LOCKED",
      403,
    );
  }

  // Reset counters on successful login
  if (user.failed_login_attempts > 0 || user.locked_until) {
    await userModel.update(user.id, {
      failed_login_attempts: 0,
      locked_at: null,
      locked_until: null,
    });
  }

  if (!user.email_verified_at) {
    throw new AppError(
      "Cuenta no verificada. Revisa tu correo.",
      "EMAIL_NOT_VERIFIED",
      403,
    );
  }

  if (user.deleted_at) {
    throw new AppError("Esta cuenta ha sido eliminada", "ACCOUNT_DELETED", 403);
  }

  const accessToken = jwt.sign(
    { sub: user.id, role_id: user.role_id },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpiration },
  );

  return { accessToken, user_id: user.id };
};

export const changeUserPassword = async (
  id,
  { old_password, new_password },
) => {
  const user = await userModel.find(id);
  if (!user) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  const validOldPassword = await bcrypt.compare(old_password, user.password);
  if (!validOldPassword) {
    throw new AppError(
      "La contraseña antigua no es correcta",
      "INVALID_CREDENTIALS",
      401,
    );
  }

  return await userModel.withRole().update(id, {
    password: await bcrypt.hash(new_password, config.security.bcryptRounds),
  });
};

export const deleteUser = async (id) => {
  const exist = await userModel.find(id);
  if (!exist) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await userModel.delete(id);
};
