import Ticket from "./ticket.model.js";
import User from "../users/user.model.js";
import { TicketPolicy } from "./ticket.policy.js";
import { TicketWorkflow } from "../ticket_status/ticketStatus.workflow.js";
import AppError from "../../utils/AppError.js";

const ticketModel = new Ticket();

export const getAllTickets = async () => {
  return ticketModel.all();
};

export const getAllTicketsByAssigned = async (userId) => {
  return ticketModel.allAssignedToUser(userId);
};

export const getAllTicketsWithoutAssignment = async () => {
  return ticketModel.withoutAssignment();
};

export const getAllTicketsByUser = async (userId) => {
  return ticketModel.allByUser(userId);
};

export const getTicketById = async (id, user) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!TicketPolicy.view(user, ticket)) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  return ticket;
};

export const createTicket = async ({ title, description }, user) => {
  if (!TicketPolicy.create(user)) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  return await ticketModel.create({
    title,
    description,
    created_by: user.id,
  });
};

export const updateTicket = async (id, data, user) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!TicketPolicy.update(user, ticket)) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  // The property "assigned_to", only can change from the endpoint assign
  if (Object.hasOwn(data, "assigned_to")) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  // The property "ticket_status_id", only can change from the endpoint change_status
  if (Object.hasOwn(data, "ticket_status_id")) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  return await ticketModel.update(id, data);
};

export const selfAssignTicket = async (id, user) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!TicketPolicy.canSelfAssign(user, ticket)) {
    throw new AppError(
      "No puedes auto-asignarte este ticket",
      "FORBIDDEN",
      403,
    );
  }

  return ticketModel.update(id, { assigned_to: user.id });
};

export const assignTicketToUser = async (id, targetUserId, user) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!TicketPolicy.canAssign(user, ticket)) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  const userModel = new User();
  const targetUser = await userModel.find(targetUserId);
  if (!targetUser) {
    throw new AppError("Usuario no encontrado", "NOT_FOUND", 404);
  }

  if (!TicketPolicy.canBeAssignedTo(targetUser)) {
    throw new AppError("Usuario inválido para asignación", "BAD_REQUEST", 400);
  }

  return ticketModel.update(id, { assigned_to: targetUserId });
};

export const changeStatusTicket = async (id, data, user) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!TicketPolicy.canChangeStatus(user, ticket)) {
    throw new AppError("Usuario no puede cambiar valor", "FORBIDDEN", 403);
  }

  // Validate status workflow transition
  if (
    !TicketWorkflow.canTransition(
      ticket.ticket_status_id,
      data.ticket_status_id,
    )
  ) {
    throw new AppError(
      "Transición de estado inválida",
      "INVALID_STATUS_TRANSITION",
      400,
    );
  }

  return await ticketModel.update(id, data);
};

export const deleteTicket = async (id, user) => {
  const ticket = await ticketModel.find(id);
  if (!ticket) {
    throw new AppError("Registro no encontrado", "NOT_FOUND", 404);
  }

  if (!TicketPolicy.delete(user)) {
    throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
  }

  return await ticketModel.delete(id);
};
