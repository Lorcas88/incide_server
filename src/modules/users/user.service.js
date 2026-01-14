import bcrypt from "bcrypt";
import User from "./user.model.js";
import Role from "../roles/role.model.js";
import AppError from "../../utils/AppError.js";

const userModel = new User();
const roleModel = new Role();

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

  const updateData = { ...data };

  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase().trim();
  }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  return await userModel.update(id, updateData);
};

export const deleteUser = async (id) => {
  const user = await userModel.find(id);
  if (!user) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await userModel.delete(id);
};
