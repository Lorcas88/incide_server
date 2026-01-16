import Ticket from "./ticket.model.js";
import Role from "../roles/role.model.js";
import AppError from "../../utils/AppError.js";

const ticketModel = new Ticket();
const roleModel = new Role();

export const getAllTickets = async (user) => {
  const role = await roleModel.find(user.role_id);
  if (role && role.name === "admin") {
    return ticketModel.all();
  }
  return ticketModel.findByCreator(user.id);
};

export const getTicketById = async (id) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return ticket;
};

export const createTicket = async ({ title, description }, created_by) => {
  return await ticketModel.create({
    title,
    description,
    created_by,
  });
};

export const updateTicket = async (id, data) => {
  const exist = await ticketModel.find(id);
  if (!exist) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await ticketModel.update(id, data);
};

export const deleteTicket = async (id) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await ticketModel.delete(id);
};
