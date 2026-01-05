import { all, find, create, updateById, deleteById } from "./ticket.model.js";

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

export const createService = async ({ title, description }, created_by) => {
  return await create({
    title,
    description,
    created_by,
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
