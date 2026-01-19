import Ticket from "./ticket.model.js";
import AppError from "../../utils/AppError.js";

const ticketModel = new Ticket();

export const getAllTickets = async (user) => {
  if (user.role_id === 1) {
    return ticketModel.all();
  }
  return ticketModel.findByUser(user.id);
};

export const getTicketById = async (id, user) => {
  const ticket = await ticketModel.findRaw(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (user.role_id !== 1 && ticket.created_by !== user.id) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  return ticketModel.toArray([ticket])[0];
};

export const createTicket = async ({ title, description }, created_by) => {
  return await ticketModel.create({
    title,
    description,
    created_by,
  });
};

export const updateTicket = async (id, data, user) => {
  const ticket = await ticketModel.findRaw(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (user.role_id !== 1 && ticket.created_by !== user.id) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  return await ticketModel.update(id, data);
};

export const deleteTicket = async (id, user) => {
  const ticket = await ticketModel.findRaw(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (user.role_id !== 1 && ticket.created_by !== user.id) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  return await ticketModel.delete(id);
};
