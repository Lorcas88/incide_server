import { Router } from "express";
import { register, login, me, destroy } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { registerValidation, loginValidation } from "./auth.validator.js";

const router = Router();

// Register
router.post("/register", registerValidation, register);

// Login
router.post("/login", loginValidation, login);

// User profile
router.get("/me", authMiddleware, me);

// Unsubscribe user
router.delete("/unsubscribe", authMiddleware, destroy);

export default router;
