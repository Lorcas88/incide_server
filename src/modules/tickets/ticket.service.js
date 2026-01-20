import Ticket from "./ticket.model.js";
import AppError from "../../utils/AppError.js";

const ticketModel = new Ticket();

export const getAllTickets = async (currentUser) => {
  if (currentUser.role_id === 1) {
    return ticketModel.all();
  }
  return ticketModel.findAllByUserId(currentUser.id);
};

export const getTicketById = async (id, currentUser) => {
  const ticket = await ticketModel.findRaw(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (currentUser.role_id !== 1 && ticket.created_by !== currentUser.id) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
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

export const updateTicket = async (id, data, currentUser) => {
  const ticket = await ticketModel.findRaw(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (currentUser.role_id !== 1 && ticket.created_by !== currentUser.id) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await ticketModel.update(id, data);
};

export const deleteTicket = async (id, currentUser) => {
  const ticket = await ticketModel.findRaw(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (currentUser.role_id !== 1 && ticket.created_by !== currentUser.id) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  return await ticketModel.delete(id);
};
