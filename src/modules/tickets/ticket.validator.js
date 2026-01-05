import { body, validationResult } from "express-validator";

// Reglas de validación para el registro de usuarios
export const ticketValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("El título es requerido")
    .isLength({ max: 150 })
    .withMessage("El título no debe tener mas de 150 caracteres"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("La descripción es requerida"),
];

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
