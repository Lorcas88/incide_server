import { asyncHandler } from "../../utils/asyncHandler.js";
import { serialize } from "../../utils/utils.js";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getAllTicketsByAssigned,
  getAllTicketsWithoutAssignment,
  getAllTicketsByUser,
  selfAssignTicket,
  assignTicketToUser,
  changeTicketStatus,
  restoreTicket,
} from "./ticket.service.js";

const hidden = [];

export const index = asyncHandler(async (req, res) => {
  const tickets = await getAllTickets();

  res.status(200).json({ data: serialize(tickets, hidden) });
});

export const indexByAssigned = asyncHandler(async (req, res) => {
  const tickets = await getAllTicketsByAssigned(req.user.id);

  res.status(200).json({ data: serialize(tickets, hidden) });
});

export const indexWithoutAssignment = asyncHandler(async (req, res) => {
  const tickets = await getAllTicketsWithoutAssignment();

  res.status(200).json({ data: serialize(tickets, hidden) });
});

export const indexByUser = asyncHandler(async (req, res) => {
  const tickets = await getAllTicketsByUser(req.user.id);

  res.status(200).json({ data: serialize(tickets, hidden) });
});

export const show = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ticket = await getTicketById(id, req.user);
  res.status(200).json({ data: serialize(ticket, hidden) });
});

export const store = asyncHandler(async (req, res) => {
  const ticket = await createTicket(req.body, req.user);

  res.status(201).json({ data: serialize(ticket, hidden) });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await updateTicket(id, req.body, req.user);

  res.status(200).json({ data: serialize(ticket, hidden) });
});

export const selfAssign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await selfAssignTicket(id, req.user);

  res.status(200).json({ data: serialize(ticket, hidden) });
});

export const assignToUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  const ticket = await assignTicketToUser(id, assigned_to, req.user);

  res.status(200).json({ data: serialize(ticket, hidden) });
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await changeTicketStatus(id, req.body, req.user);

  res.status(200).json({ data: serialize(ticket, hidden) });
});

export const destroy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteTicket(id, req.user);

  res.status(204).json();
});

export const restore = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await restoreTicket(id, req.user);

  res.status(200).json({ data: serialize(ticket, hidden) });
});
