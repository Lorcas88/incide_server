import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  registerUser,
  loginUser,
  deleteUser,
  getUserById,
} from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({ data: user });
});

export const login = asyncHandler(async (req, res) => {
  const token = await loginUser(req.body);

  res.status(200).json({ token });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  res.status(200).json({ data: user });
});

export const destroy = asyncHandler(async (req, res) => {
  await deleteUser(req.user.id);

  res.status(204).json();
});
