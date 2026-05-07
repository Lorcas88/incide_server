import RefreshToken from "../refresh-tokens/refreshToken.model.js";
import User from "../users/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { config } from "../../config/config.js";
import AppError from "../../utils/AppError.js";
import { hash } from "../../utils/utils.js";

const refreshTokenModel = new RefreshToken();
const userModel = new User();

export const saveToken = async (
  userId,
  expiresAt,
  ipAddress = null,
  userAgent = null,
) => {
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = hash(refreshToken);

  await refreshTokenModel.create({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: hash(userAgent),
  });

  // Return the plain token to send to client, NOT the DB object
  return refreshToken;
};

export const refreshToken = async (
  token,
  expiresAt,
  ipAddress = null,
  userAgent = null,
) => {
  if (!token) {
    throw new AppError("Token requerido", "REFRESH_TOKEN_REQUIRED", 401);
  }

  // Hash the token before looking it up in DB
  const tokenHash = hash(token);

  const storedToken = await refreshTokenModel.findByTokenHash(tokenHash);
  if (!storedToken) {
    throw new AppError("Token inválido", "REFRESH_TOKEN_INVALID", 401);
  }

  // Expired token
  if (new Date(storedToken.expires_at) < new Date()) {
    throw new AppError("Token expirado", "REFRESH_TOKEN_EXPIRED", 401);
  }

  // Reuse attack
  if (storedToken.used_at) {
    await refreshTokenModel.revokeAllForUser(storedToken.user_id);
    throw new AppError(
      "Refresh token comprometido",
      "REFRESH_TOKEN_REUSE",
      401,
    );
  }

  // Soft security checks
  if (storedToken.ip_address && storedToken.ip_address !== ipAddress) {
    await refreshTokenModel.revokeAllForUser(storedToken.user_id);
    throw new AppError("Refresh token inválido", "REFRESH_TOKEN_INVALID", 401);
  }

  const uaHash = hash(userAgent);
  if (storedToken.user_agent && uaHash && storedToken.user_agent !== uaHash) {
    await refreshTokenModel.revokeAllForUser(storedToken.user_id);
    throw new AppError("Refresh token inválido", "REFRESH_TOKEN_INVALID", 401);
  }

  // Mark token as used. If can't mark, someone used it
  const wasMarkedAsUsed = await refreshTokenModel.markAsUsed(storedToken.id);
  if (!wasMarkedAsUsed) {
    await refreshTokenModel.revokeAllForUser(storedToken.user_id);
    throw new AppError(
      "Refresh token comprometido",
      "REFRESH_TOKEN_REUSE",
      401,
    );
  }

  // Rotate refresh token
  const newRefreshToken = crypto.randomBytes(40).toString("hex");
  const newTokenHash = hash(newRefreshToken);

  await refreshTokenModel.create({
    user_id: storedToken.user_id,
    token_hash: newTokenHash,
    expires_at: expiresAt,
    ip_address: ipAddress,
    user_agent: uaHash,
  });

  // Issue new access token
  const user = await userModel.find(storedToken.user_id);

  const accessToken = jwt.sign(
    { sub: user.id, role_id: user.role_id },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtExpiration },
  );

  return { access_token: accessToken, refresh_token: newRefreshToken };
};

export const revokeToken = async (token) => {
  if (!token) return;

  const tokenHash = hash(token);
  const stored = await refreshTokenModel.findOne({ token: tokenHash });

  if (stored) {
    await refreshTokenModel.revoke(stored.id);
  }
};

export const revokeAllForUser = async (userId) => {
  await refreshTokenModel.revokeAllForUser(userId);
};
