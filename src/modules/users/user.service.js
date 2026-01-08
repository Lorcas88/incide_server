import bcrypt from "bcrypt";
import User from "./user.model.js";
import AppError from "../../utils/AppError.js";

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
    password: await bcrypt.hash(password, 10),
    role_id,
  });
};

export const updateUser = async (id, data) => {
  const user = await userModel.find(id);
  if (!user) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
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
