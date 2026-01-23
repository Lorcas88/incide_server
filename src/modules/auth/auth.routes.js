import { Router } from "express";
import {
  register,
  login,
  me,
  destroy,
  logout,
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

const router = Router();

// Register
router.post("/register", registerValidation, register);

// Login
router.post("/login", loginValidation, login);

// Refresh token (NO authMiddleware - the access token has expired)
router.post("/refresh", refresh);

// Forgot password
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);

// Reset password
router.post("/reset-password", resetPasswordValidation, resetPassword);

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
router.post("/logout", logout);

export default router;
