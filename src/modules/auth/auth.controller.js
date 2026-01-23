import { config } from "../../config/config.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addDays, addMinutes, serialize } from "../../utils/utils.js";
import {
  registerUser,
  loginUser,
  deleteUser,
  getUserById,
  changePasswordUser,
} from "./auth.service.js";
import {
  refreshToken,
  saveToken,
  revokeToken,
  revokeAllForUser,
} from "../refresh-tokens/refreshToken.service.js";
import {
  createToken,
  resetPasswordUser,
} from "../password-resets/passwordReset.service.js";

const hidden = ["password", "role_id"];

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({ data: serialize(user, hidden) });
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

export const forgotPassword = asyncHandler(async (req, res) => {
  await createToken(req.body, addMinutes(15));
  // Always return success to prevent email enumeration
  res.status(200).json({
    message: `Se han enviado instrucciones al correo.`,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordUser(req.body);

  res.status(200).json({
    message: "Contraseña actualizada correctamente. Por favor inicia sesión.",
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const user = await changePasswordUser(req.user.id, req.body);

  await revokeAllForUser(req.user.id);

  res.json({ data: serialize(user, hidden) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id);

  res.status(200).json({ data: serialize(user, hidden) });
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
