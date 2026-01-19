import { config } from "../../config/config.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addDays } from "../../utils/utils.js";
import {
  registerUser,
  loginUser,
  deleteUser,
  getUserById,
} from "./auth.service.js";
import {
  refreshToken,
  saveToken,
  revokeToken,
  revokeAllForUser,
} from "./refreshToken.service.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({ data: user });
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, user_id: userId } = await loginUser(req.body);

  const refreshTokenValue = await saveToken(userId, addDays(7));

  res
    .cookie("refresh_token", refreshTokenValue, {
      ...config.cookies,
      path: "/api/v1/auth/refresh",
    })
    .status(200)
    .json({ data: { token: accessToken } });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = await refreshToken(req.cookies.refresh_token, addDays(7));

  res
    .cookie("refresh_token", token.refresh_token, {
      ...config.cookies,
      path: "/api/v1/auth/refresh",
    })
    .json({ data: { token: token.access_token } });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  res.status(200).json({ data: user });
});

export const destroy = asyncHandler(async (req, res) => {
  await deleteUser(req.user.id);

  await revokeAllForUser(req.user.id);

  res.sendStatus(204);
});

export const logout = asyncHandler(async (req, res) => {
  await revokeToken(req.cookies.refresh_token);
  res
    .clearCookie("refresh_token", { path: "/api/v1/auth/refresh" })
    .sendStatus(204);
});
