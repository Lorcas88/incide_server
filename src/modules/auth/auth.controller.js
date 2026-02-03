import { config } from "../../config/config.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { addDays, addMinutes, serialize } from "../../utils/utils.js";
import {
  registerUser,
  loginUser,
  getUserById,
  changeUserPassword,
  deleteUser,
} from "./auth.service.js";
import {
  saveToken,
  refreshToken,
  revokeToken,
  revokeAllForUser,
} from "../refresh-tokens/refreshToken.service.js";
import {
  createToken,
  resetPasswordUser,
  confirmationUser,
} from "../user-tokens/userToken.service.js";
import { TYPES } from "../user-tokens/userToken.constants.js";
import { getClientIp, getUserAgent } from "../../utils/requestInfo.js";

const hidden = [
  "password",
  "role_id",
  "created_at",
  "email_active",
  "email_verified_at",
  "updated_at",
  "deleted_at",
  "failed_login_attempts",
  "locked_at",
  "locked_until",
];

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  const verificationToken = await createToken(
    req.body,
    addMinutes(60),
    TYPES.EMAIL,
  );

  // In test environment, include the verification token in response
  if (process.env.NODE_ENV === "test" && verificationToken) {
    res.status(201).json({
      data: {
        ...serialize(user, hidden),
        verification_token: verificationToken,
      },
    });
  } else {
    res.status(201).json({ data: serialize(user, hidden) });
  }
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, user_id: userId } = await loginUser(req.body);

  // Extract IP and User-Agent for tracking
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);

  const refreshTokenValue = await saveToken(
    userId,
    addDays(7),
    ipAddress,
    userAgent,
  );

  res
    .cookie("refresh_token", refreshTokenValue, {
      ...config.cookies,
      path: "/api/v1/auth/refresh",
    })
    .status(200)
    .json({ data: { token: accessToken } });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;

  // Extract IP and User-Agent for tracking
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);

  const { access_token, refresh_token } = await refreshToken(
    token,
    addDays(7),
    ipAddress,
    userAgent,
  );

  res
    .cookie("refresh_token", refresh_token, {
      ...config.cookies,
      path: "/api/v1/auth/refresh",
    })
    .json({ data: { token: access_token } });
});

export const confirmation = asyncHandler(async (req, res) => {
  await confirmationUser(req.body);

  res.status(200).json({
    message: "Usuario confirmado",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await createToken({ email }, addMinutes(15), TYPES.PASSWORD);
  // Always return success to prevent email enumeration
  res.status(200).json({
    message: `Se han enviado instrucciones al correo.`,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordUser(req.body);

  res.status(200).json({
    message: "Contraseña restablecida exitosamente.",
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await changeUserPassword(req.user.id, req.body);

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

export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllForUser(req.user.id);
  res
    .clearCookie("refresh_token", { path: "/api/v1/auth/refresh" })
    .sendStatus(204);
});
