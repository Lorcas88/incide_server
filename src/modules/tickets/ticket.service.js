import Ticket from "./ticket.model.js";
import AppError from "../../utils/AppError.js";

const ticketModel = new Ticket();

export const getAllTickets = async () => {
  return ticketModel.all();
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

export const updateTicket = async (id, data, userId) => {
  const ticket = await ticketModel.findByIdRaw(id);

  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (ticket.created_by !== userId) {
     throw new AppError("No tienes permiso para realizar esta acción", "FORBIDDEN", 403);
  }

  return await ticketModel.update(id, data);
};

export const deleteTicket = async (id, userId) => {
  const ticket = await ticketModel.findByIdRaw(id);

  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (ticket.created_by !== userId) {
     throw new AppError("No tienes permiso para realizar esta acción", "FORBIDDEN", 403);
  }

  return await ticketModel.delete(id);
};
