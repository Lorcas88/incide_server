import Ticket from "./ticket.model.js";
import User from "../users/user.model.js";
import { TicketPolicy } from "./ticket.policy.js";
import { TicketWorkflow } from "../ticket-status/ticketStatus.workflow.js";
import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import {
  sendTicketAssignedEmail,
  sendTicketStatusChangedEmail,
} from "../../core/mailer.js";

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

  // First, it's set an array that contains the updatable fields,
  // then the data object is changed to an array, to evaluate if
  // it contains values from the updatable array. Finally, the
  // array is restore as an object. This was made to allow partial update.
  const updatable = ["title", "description"];
  const dataFilter = Object.fromEntries(
    Object.entries(data).filter(([key]) => updatable.includes(key)),
  );

  return await ticketModel.update(id, dataFilter);
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

  const updatedTicket = await ticketModel.update(id, {
    assigned_to: targetUserId,
  });

  // Send notification to assigned user
  if (targetUser.email) {
    await sendTicketAssignedEmail(
      targetUser.email,
      targetUser.first_name,
      ticket.id,
      ticket.title,
    );
  }

  return updatedTicket;
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

  // Log status change for audit trail
  logger.info("Ticket status changed", {
    ticketId: id,
    oldStatus: ticket.ticket_status_id,
    newStatus: data.ticket_status_id,
    changedBy: user.id,
  });

  const updatedTicket = await ticketModel.update(id, {
    ticket_status_id: data.ticket_status_id,
  });

  // Send notification to ticket creator
  const userModel = new User();
  const creator = await userModel.find(ticket.created_by);
  if (creator && creator.email) {
    await sendTicketStatusChangedEmail(
      creator.email,
      creator.first_name,
      ticket.id,
      ticket.title,
      data.ticket_status_id,
    );
  }

  return updatedTicket;
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
