import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import { config } from "../../config/config.js";
import AppError from "../../utils/AppError.js";

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
    password: await bcrypt.hash(password, 10),
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);

  // Prevention of Timing Attack (User Enumeration)
  // We compare the password against the user's password OR a dummy hash
  // This ensures the operation takes roughly the same time whether the user exists or not.
  const passwordToCompare = user
    ? user.password
    : "$2b$10$0Qfa/aqTaPt4Ba1o6mnBjeafYW.klPCItg6r.A/7L0opfuOkfIIRy"; // Dummy hash

  const isValidPassword = await bcrypt.compare(password, passwordToCompare);

  if (!user || !isValidPassword) {
    throw new AppError("Credenciales inválidas", "INVALID_CREDENTIALS", 401);
  }

  return jwt.sign(
    { sub: user.id, role_id: user.role_id },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpiration },
  );
};

// Para otra version se adaptará la lógica de baja de usuario
export const deleteUser = async (id) => {
  const exist = await userModel.find(id);
  if (!exist) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await userModel.delete(id);
};
