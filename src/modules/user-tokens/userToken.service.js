import UserToken from "./userToken.model.js";
import RefreshToken from "../refresh-tokens/refreshToken.model.js";
import User from "../users/user.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import AppError from "../../utils/AppError.js";
import { hash } from "../../utils/utils.js";
import { sendForgotEmail, sendConfirmationEmail } from "../../core/mailer.js";
import { TYPES } from "./userToken.constants.js";

const userTokenModel = new UserToken();
const RefreshTokenModel = new RefreshToken();
const userModel = new User();

export const createToken = async ({ email }, expiresAt, type) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    // Return void to prevent email enumeration, but log internally if needed
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hash(token);

  await userTokenModel.create({
    user_id: user.id,
    type,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (type === "email_verification") {
    await sendConfirmationEmail(email, user.first_name, token);
  } else {
    await sendForgotEmail(email, user.first_name, token);
  }

  // In test environment, return the unhashed token for testing purposes
  if (process.env.NODE_ENV === "test") {
    return token;
  }

  // Return nothing/void for security in production
  return;
};

export const confirmationUser = async ({ token }) => {
  if (!token) {
    throw new AppError("Token requerido", "TOKEN_REQUIRED", 400);
  }

  const tokenHash = hash(token);
  const storedToken = await userTokenModel.findByTokenHash(tokenHash);
  if (!storedToken) {
    throw new AppError("Token inválido o expirado", "INVALID_TOKEN", 400);
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    await userTokenModel.delete(storedToken.id);
    throw new AppError("Token inválido o expirado", "TOKEN_EXPIRED", 400);
  }

  // Check if email is already verified
  const user = await userModel.find(storedToken.user_id);
  if (user && user.email_verified_at) {
    // Delete the token and throw error
    await userTokenModel.delete(storedToken.id);
    throw new AppError("Token inválido o expirado", "INVALID_TOKEN", 400);
  }

  // Update email_verified_at
  await userModel.verifyEmail(storedToken.user_id);

  // Delete the token once it's used
  await userTokenModel.delete(storedToken.id);

  return;
};

export const resendConfirmationUser = async ({ email }) => {
  if (!email) {
    throw new AppError("Email requerido", "EMAIL_REQUIRED", 400);
  }

  // Silently return if user doesn't exist (prevent email enumeration)
  const user = await userModel.findByEmail(email);
  if (!user) {
    return;
  }

  // Check if already verified
  if (user.email_verified_at) {
    throw new AppError("La cuenta ya está verificada", "ALREADY_VERIFIED", 400);
  }

  // Invalidate all previous email verification tokens
  await userTokenModel.invalidateAllByType(user.id, TYPES.EMAIL);

  return user;
};

export const resetPasswordUser = async ({ token, password }) => {
  if (!token) {
    throw new AppError("Token requerido", "TOKEN_REQUIRED", 400);
  }

  const tokenHash = hash(token);
  const storedToken = await userTokenModel.findByTokenHash(tokenHash);
  if (!storedToken) {
    throw new AppError("Token inválido o expirado", "INVALID_TOKEN", 400);
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    throw new AppError("Token expirado", "TOKEN_EXPIRED", 400);
  }

  // Update password
  const hashedPassword = await bcrypt.hash(password, 10);
  await userModel.update(storedToken.user_id, {
    password: hashedPassword,
  });

  // Delete token after use (hard delete)
  await userTokenModel.delete(storedToken.id);

  // Revoke all existing sessions for security
  await RefreshTokenModel.revokeAllForUser(storedToken.user_id);

  return;
};
