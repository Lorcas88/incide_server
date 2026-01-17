import { Router } from "express";
import { register, login, me, destroy, logout } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";
import { registerValidation, loginValidation } from "./auth.validator.js";

const router = Router();

// Register
router.post("/register", authLimiter, registerValidation, register);

// Login
router.post("/login", authLimiter, loginValidation, login);

// User profile
router.get("/me", authMiddleware, me);

// Unsubscribe user
router.delete("/unsubscribe", authMiddleware, destroy);

// Logout
router.post("/logout", logout);

export default router;
