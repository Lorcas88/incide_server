import { body, param } from "express-validator";
import { validateResult } from "../../middlewares/validation.middleware.js";
import TicketStatus from "../ticket-status/ticketStatus.model.js";

const ticketStatusModel = new TicketStatus();

export const assignValidation = [
  body("assigned_to")
    .notEmpty()
    .withMessage("El assigned_to es requerido")
    .isInt()
    .withMessage("El assigned_to debe ser un número entero"),

  validateResult,
];

export const changeStatusValidation = [
  body("ticket_status_id")
    .notEmpty()
    .withMessage("El ticket_status_id es requerido")
    .isInt()
    .withMessage("El ticket_status_id debe ser un número entero")
    .custom(async (value) => {
      const status = await ticketStatusModel.find(value);
      if (!status) {
        throw new Error("El estado del ticket no es válido");
      }
      return true;
    }),

  validateResult,
];

export const idValidation = [
  param("id").isInt().withMessage("El ID debe ser un número entero"),

  validateResult,
];

export const storeValidation = [
  body("title")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("El título es requerido")
    .isLength({ max: 150 })
    .withMessage("El título no debe tener mas de 150 caracteres"),

  body("description")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("La descripción es requerida"),

  validateResult,
];

export const updateValidation = [
  idValidation,

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .escape()
    .withMessage("El título es requerido")
    .isLength({ max: 150 })
    .withMessage("El título no debe tener mas de 150 caracteres"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .escape()
    .withMessage("La descripción es requerida"),

  validateResult,
];
