import bcrypt from "bcrypt";
import User from "./user.model.js";
import AppError from "../../utils/AppError.js";
import { config } from "../../config/config.js";

const userModel = new User();

export const getAllUsers = async () => {
  return userModel.all();
};

export const getUserById = async (id) => {
  const user = await userModel.find(id);
  if (!user) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return user;
};

export const createUser = async ({
  first_name,
  last_name,
  email,
  password,
  role_id,
}) => {
  const user = await userModel.findByEmail(email);
  if (user) {
    throw new AppError("Usuario ya existe", "DUPLICATE_ENTRY", 409);
  }

  return await userModel.create({
    first_name,
    last_name,
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, config.security.bcryptRounds),
    role_id,
  });
};

export const updateUser = async (id, data) => {
  const { email, password } = data;

  const user = await userModel.find(id);
  if (!user) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (email) {
    const existing = await userModel.findByEmail(email);
    if (existing && existing.id !== id) {
      throw new AppError("Usuario ya existe", "DUPLICATE_ENTRY", 409);
    }
  }

  if (password) {
    data.password = await bcrypt.hash(password, config.security.bcryptRounds);
  }

  return await userModel.update(id, data);
};

export const deleteUser = async (id) => {
  const user = await userModel.find(id);
  if (!user) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await userModel.delete(id);
};

export const restoreUser = async (id) => {
  // Use onlyDeleted scope to find soft-deleted users
  const user = await userModel.onlyDeleted().find(id);
  if (!user) {
    throw new AppError(
      "Usuario no encontrado o no está eliminado",
      "NOT_FOUND",
      404,
    );
  }

  return await userModel.restore(id);
};
