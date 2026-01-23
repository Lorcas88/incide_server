import PasswordReset from "../password-resets/passwordReset.model.js";
import RefreshToken from "../refresh-tokens/refreshToken.model.js";
import User from "../users/user.model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import AppError from "../../utils/AppError.js";
import { hash } from "../../utils/utils.js";
import { sendForgotEmail } from "../../core/mailer.js";

const passwordResetModel = new PasswordReset();
const RefreshTokenModel = new RefreshToken();
const userModel = new User();

export const createToken = async ({ email }, expiresAt) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    // Return void to prevent email enumeration, but log internally if needed
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hash(token);

  await passwordResetModel.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  await sendForgotEmail(email, user.first_name, token);

  // Return nothing/void for security
  return;
};

export const resetPasswordUser = async ({ token, password }) => {
  if (!token) {
    throw new AppError("Token requerido", "TOKEN_REQUIRED", 400);
  }

  const tokenHash = hash(token);
  const storedToken = await passwordResetModel.findByTokenHash(tokenHash);

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

  // Mark token as used
  await passwordResetModel.markAsUsed(storedToken.id);

  // Revoke all existing sessions for security
  await RefreshTokenModel.revokeAllForUser(storedToken.user_id);

  return;
};
