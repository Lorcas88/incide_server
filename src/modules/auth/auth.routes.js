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
  loginLimiter,
  resetPasswordLimiter,
  refreshLimiter,
} from "../../middlewares/rateLimiter.middleware.js";

const router = Router();

// Register
router.post("/register", registerValidation, register);

// Login
router.post("/login", loginLimiter, loginValidation, login);

// Refresh token (NO authMiddleware - the access token has expired)
router.post("/refresh", refreshLimiter, refresh);

// Forgot password
router.post(
  "/forgot-password",
  resetPasswordLimiter,
  forgotPasswordValidation,
  forgotPassword,
);

// Reset password
router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPasswordValidation,
  resetPassword,
);

// Change password
router.post(
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
router.post("/logout", authMiddleware, logout);

// Logout
router.post("/logout-all", authMiddleware, logoutAll);

export default router;
