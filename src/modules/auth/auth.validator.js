import { body, validationResult } from "express-validator";

// Reglas de validación para el registro de usuarios
export const registerValidation = [
  body("first_name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres"),

  body("last_name")
    .trim()
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El apellido debe tener entre 3 y 50 caracteres"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isStrongPassword()
    .withMessage(
      "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo"
    ),

  body("password_confirmation")
    .notEmpty()
    .withMessage("La confirmación de contraseña es requerida")
    .custom((value, { req }) => {
      if (value !== req.body.password_confirmation) {
        throw new Error("Las contraseñas no coinciden");
      }

      return true;
    }),
];

// Reglas de validación para el login de usuarios
export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("La contraseña es requerida"),
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
