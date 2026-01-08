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
  if (!user) {
    throw new AppError("Credenciales inválidas", "INVALID_CREDENTIALS", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError("Credenciales inválidas", "INVALID_CREDENTIALS", 401);
  }

  return jwt.sign(
    // { sub: user.id, email: user.email, role_id: user.role_id },
    { sub: user.id },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpiration }
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
