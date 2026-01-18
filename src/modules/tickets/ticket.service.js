import Ticket from "./ticket.model.js";
import Role from "../roles/role.model.js";
import AppError from "../../utils/AppError.js";

const ticketModel = new Ticket();
const roleModel = new Role();

const isAdmin = async (user) => {
  if (!user || !user.role_id) return false;
  const role = await roleModel.find(user.role_id);
  return role && role.name === "admin";
};

export const getAllTickets = async (user) => {
  if (await isAdmin(user)) {
    return ticketModel.all();
  }
  return ticketModel.findAllByUserId(user.id);
};

export const getTicketById = async (id, user) => {
  const ticketRaw = await ticketModel.findByIdRaw(id);
  if (!ticketRaw) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!(await isAdmin(user)) && ticketRaw.created_by !== user.id) {
    throw new AppError("No autorizado", "FORBIDDEN", 403);
  }

  return ticketModel.toArray([ticketRaw])[0];
};

export const createTicket = async ({ title, description }, created_by) => {
  return await ticketModel.create({
    title,
    description,
    created_by,
  });
};

export const updateTicket = async (id, data, user) => {
  const ticketRaw = await ticketModel.findByIdRaw(id);
  if (!ticketRaw) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!(await isAdmin(user)) && ticketRaw.created_by !== user.id) {
    throw new AppError("No autorizado", "FORBIDDEN", 403);
  }

  return await ticketModel.update(id, data);
};

export const deleteTicket = async (id, user) => {
  const ticketRaw = await ticketModel.findByIdRaw(id);
  if (!ticketRaw) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!(await isAdmin(user)) && ticketRaw.created_by !== user.id) {
    throw new AppError("No autorizado", "FORBIDDEN", 403);
  }

  return await ticketModel.delete(id);
};
