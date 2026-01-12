import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "./ticket.service.js";

export const index = asyncHandler(async (req, res) => {
  const tickets = await getAllTickets();

  res.status(200).json({ data: tickets });
});

export const show = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await getTicketById(id);

  res.status(200).json({ data: ticket });
});

export const store = asyncHandler(async (req, res) => {
  const ticket = await createTicket(req.body, req.user.id);

  res.status(201).json({ data: ticket });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await updateTicket(id, req.body, req.user.id);

  res.status(200).json({ data: ticket });
});

export const destroy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteTicket(id, req.user.id);

  res.status(204).json();
});
