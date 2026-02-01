import { Router } from "express";
import {
  destroy,
  index,
  show,
  store,
  update,
  restore,
} from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  idValidation,
  storeValidation,
  updateValidation,
} from "./user.validator.js";
import { ROLES } from "../roles/role.constants.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Get all users
router.get("/", authMiddleware, authorize(ROLES.ADMIN), index);

// Get a user by id
router.get("/:id", authMiddleware, authorize(ROLES.ADMIN), idValidation, show);

// Create a new user
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.ADMIN),
  storeValidation,
  store,
);

// Update a user
router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  updateValidation,
  update,
);

// Delete a user
router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  idValidation,
  destroy,
);

// Restore a soft-deleted user
router.patch(
  "/:id/restore",
  authMiddleware,
  authorize(ROLES.ADMIN),
  idValidation,
  restore,
);

export default router;
