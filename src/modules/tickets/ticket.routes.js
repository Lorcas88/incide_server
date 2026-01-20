import { Router } from "express";
import {
  destroy,
  index,
  show,
  store,
  update,
  indexByAssigned,
  indexWithoutAssignment,
  indexByUser,
  selfAssign,
  assignToUser,
  changeStatus,
} from "./ticket.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  idValidation,
  storeValidation,
  updateValidation,
  assignValidation,
  changeStatusValidation,
} from "./ticket.validator.js";
import { ROLES } from "../roles/role.constants.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Get all tickets
router.get("/", authMiddleware, authorize(ROLES.ADMIN), index);

// Get all tickets assigned to the actual user
router.get(
  "/assigned",
  authMiddleware,
  authorize(ROLES.SUPPORT),
  indexByAssigned,
);

// Get all tickets without assignment
router.get(
  "/without_assignment",
  authMiddleware,
  authorize(ROLES.SUPPORT),
  indexWithoutAssignment,
);

// Get all tickets created by an user
router.get("/created_by", authMiddleware, authorize(ROLES.USER), indexByUser);

// Get a tickets by id
router.get("/:id", authMiddleware, idValidation, show);

// Create a new tickets
router.post(
  "/",
  authMiddleware,
  authorize(ROLES.USER, ROLES.ADMIN),
  storeValidation,
  store,
);

// Update a tickets
router.put(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN, ROLES.SUPPORT),
  updateValidation,
  update,
);

// Self assign a ticket
router.patch(
  "/:id/self_assign",
  authMiddleware,
  authorize(ROLES.SUPPORT),
  selfAssign,
);

// Change the assignment of a ticket
router.patch(
  "/:id/assign",
  authMiddleware,
  authorize(ROLES.ADMIN),
  assignValidation,
  assignToUser,
);

// Change the status of a ticket
router.patch(
  "/:id/change_status",
  authMiddleware,
  authorize(ROLES.ADMIN, ROLES.SUPPORT),
  changeStatusValidation,
  changeStatus,
);

// Delete a tickets
router.delete(
  "/:id",
  authMiddleware,
  authorize(ROLES.ADMIN),
  idValidation,
  destroy,
);

export default router;
