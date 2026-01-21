import { Router } from "express";
import {
  register,
  login,
  me,
  destroy,
  logout,
  refresh,
  changePassword,
} from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  registerValidation,
  loginValidation,
  changePasswordValidation,
} from "./auth.validator.js";

const router = Router();

// Register
router.post("/register", registerValidation, register);

// Login
router.post("/login", loginValidation, login);

// User profile
router.get("/me", authMiddleware, me);

// Refresh token (NO authMiddleware - the access token has expired)
router.post("/refresh", refresh);

// Change password
router.post(
  "/change-password",
  authMiddleware,
  changePasswordValidation,
  changePassword,
);

// Unsubscribe user
router.delete("/unsubscribe", authMiddleware, destroy);

// Logout
router.post("/logout", logout);

export default router;
