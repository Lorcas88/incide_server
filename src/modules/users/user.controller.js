import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "./user.service.js";

export const index = asyncHandler(async (req, res) => {
  const users = await getAllUsers();

  res.status(200).json({ data: users });
});

export const show = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await getUserById(id);

  res.status(200).json({ data: user });
});

export const store = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);

  res.status(201).json({ data: user });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await updateUser(id, req.body);

  res.status(200).json({ data: user });
});

export const destroy = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteUser(id);

  res.status(204).json();
});
