import bcrypt from "bcrypt";
import {
  all,
  find,
  findByEmail,
  create,
  updateById,
  deleteById,
} from "./user.model.js";

export const getAll = async () => {
  return all();
};

export const getById = async (id) => {
  const user = await find(id);
  if (!user) {
    const error = new Error("Registro no encontrado");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  return user;
};

export const createService = async ({
  first_name,
  last_name,
  email,
  password,
  role_id,
}) => {
  const existingUser = await findByEmail(email);
  if (existingUser) {
    const error = new Error("Usuario ya existe");
    error.statusCode = 409;
    error.code = "DUPLICATE_ENTRY";
    throw error;
  }

  return await create({
    first_name,
    last_name,
    email: email.toLowerCase().trim(),
    password: await bcrypt.hash(password, 10),
    role_id,
  });
};

export const updateService = async (id, data) => {
  const exist = await find(id);
  if (!exist) {
    const error = new Error("Registro no encontrado");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  return await updateById(id, data);
};

export const deleteService = async (id) => {
  const exist = await find(id);
  if (!exist) {
    const error = new Error("Registro no encontrado");
    error.statusCode = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  return await deleteById(id);
};
