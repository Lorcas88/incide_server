import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { find, findByEmail, create, deleteById } from "../users/user.model.js";

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

export const registerService = async ({
  first_name,
  last_name,
  email,
  password,
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
  });
};

export const loginService = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  return jwt.sign(
    // { sub: user.id, email: user.email, role_id: user.role_id },
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Para otra version se adaptará la lógica de baja de usuario
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
