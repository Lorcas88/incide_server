import { Router } from "express";
import { destroy, index, show, store, update } from "./ticket.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  idValidation,
  storeValidation,
  updateValidation,
} from "./ticket.validator.js";

const router = Router();

// Get all users
router.get("/", authMiddleware, index);

// Get a user by id
router.get("/:id", idValidation, authMiddleware, show);

// Create a new user
router.post("/", storeValidation, authMiddleware, store);

// Update a user
router.put("/:id", updateValidation, authMiddleware, update);

// Delete a user
router.delete("/:id", idValidation, authMiddleware, destroy);

export default router;
