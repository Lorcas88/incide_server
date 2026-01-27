import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import { config } from "../../config/config.js";
import AppError from "../../utils/AppError.js";
// import { getClientIp, getUserAgent } from "../../utils/requestInfo.js";

const userModel = new User();

export const getUserById = async (id) => {
  const user = await userModel.find(id);
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

  return await userModel.create({
    first_name,
    last_name,
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, config.security.bcryptRounds),
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new AppError("Credenciales inválidas", "INVALID_CREDENTIALS", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError("Credenciales inválidas", "INVALID_CREDENTIALS", 401);
  }

  if (!user.email_verified_at) {
    throw new AppError(
      "Cuenta no verificada. Revisa tu correo.",
      "EMAIL_NOT_VERIFIED",
      403,
    );
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

  return await userModel.update(id, {
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
