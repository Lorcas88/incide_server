import { Router } from "express";
import { destroy, index, show, store, update } from "./ticket.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { ticketValidation, validateResult } from "./ticket.validator.js";

const router = Router();

// Get all users
router.get("/", authMiddleware, index);

// Get a user by id
router.get("/:id", authMiddleware, show);

// Create a new user
router.post("/", ticketValidation, validateResult, authMiddleware, store);

// Update a user
router.put("/:id", authMiddleware, update);

// Delete a user
router.delete("/:id", authMiddleware, destroy);

export default router;
