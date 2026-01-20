import { body, param, validationResult } from "express-validator";

// Middleware para manejar errores de validación
export const validateResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

export const assignValidation = [
  body("assigned_to")
    .notEmpty()
    .withMessage("El assigned_to es requerido")
    .isInt()
    .withMessage("El assigned_to debe ser un número entero")
    .custom((value, { req }) => {
      // Ensure only assigned_to is in the body
      const bodyKeys = Object.keys(req.body);
      if (bodyKeys.length !== 1 || !bodyKeys.includes("assigned_to")) {
        throw new Error("Solo se permite el campo assigned_to");
      }
      return true;
    }),

  validateResult,
];

export const changeStatusValidation = [
  body("ticket_status_id")
    .notEmpty()
    .withMessage("El ticket_status_id es requerido")
    .isInt()
    .withMessage("El ticket_status_id debe ser un número entero")
    .custom((value, { req }) => {
      // Ensure only ticket_status_id is in the body
      const bodyKeys = Object.keys(req.body);
      if (bodyKeys.length !== 1 || !bodyKeys.includes("ticket_status_id")) {
        throw new Error("Solo se permite el campo ticket_status_id");
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
