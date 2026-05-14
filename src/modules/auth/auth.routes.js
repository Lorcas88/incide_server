import { Router } from "express";
import {
  register,
  login,
  me,
  destroy,
  logout,
  logoutAll,
  refresh,
  changePassword,
  forgotPassword,
  resetPassword,
  confirmation,
  reconfirmation,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "./auth.validator.js";
import {
  registerLimiter,
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  refreshLimiter,
  resendConfirmationLimiter,
} from "../../middlewares/rateLimiter.middleware.js";

const router = Router();

// Register
router.post("/register", registerLimiter, registerValidation, register);

// Login
router.post("/login", loginLimiter, loginValidation, login);

// Refresh token (NO authMiddleware - the access token has expired)
router.post("/refresh", refreshLimiter, refresh);

// Confirmation account
router.post("/confirm-email", confirmation);

// Send confirmation account again
router.post("/resend-confirmation", resendConfirmationLimiter, reconfirmation);

// Forgot password
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidation, forgotPassword);

// Reset password
router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPasswordValidation,
  resetPassword,
);

// Change password
router.put(
  "/change-password",
  authMiddleware,
  changePasswordValidation,
  changePassword,
);

// User profile
router.get("/me", authMiddleware, me);

// Unsubscribe user
router.delete("/unsubscribe", authMiddleware, destroy);

// Logout
router.post("/logout", logout);

// Logout of all devices
router.post("/logout-all", authMiddleware, logoutAll);

export default router;
