import { Router } from "express";
import { destroy, index, show, store, update } from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  idValidation,
  storeValidation,
  updateValidation,
} from "./user.validator.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Get all users
router.get("/", authMiddleware, authorize(1), index);

// Get a user by id
router.get("/:id", idValidation, authMiddleware, authorize(1), show);

// Create a new user
router.post("/", storeValidation, authMiddleware, authorize(1), store);

// Update a user
router.put("/:id", updateValidation, authMiddleware, authorize(1), update);

// Delete a user
router.delete("/:id", idValidation, authMiddleware, authorize(1), destroy);

export default router;
