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
