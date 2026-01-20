import { asyncHandler } from "../../utils/asyncHandler.js";
import { serialize } from "../../utils/utils.js";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./user.service.js";

const hidden = ["password", "role_id"];

export const index = asyncHandler(async (req, res) => {
  const users = await getAllUsers();

  res.status(200).json({ data: serialize(users, hidden) });
});

export const show = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await getUserById(id);

  res.status(200).json({ data: serialize(user, hidden) });
});

export const store = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);

  res.status(201).json({ data: serialize(user, hidden) });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await updateUser(id, req.body);

  res.status(200).json({ data: serialize(user, hidden) });
});

export const destroy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteUser(id);

  res.status(204).json();
});
