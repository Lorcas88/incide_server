import { body, param } from "express-validator";
import { validateResult } from "../../middlewares/validation.middleware.js";

// Validation rules for user registration
export const idValidation = [
  param("id").isInt().withMessage("El ID debe ser un número entero"),

  validateResult,
];

export const storeValidation = [
  body("first_name")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres"),

  body("last_name")
    .trim()
    .escape()
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
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isStrongPassword()
    .withMessage(
      "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
    ),

  body("password_confirmation")
    .notEmpty()
    .withMessage("La confirmación de contraseña es requerida")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }

      return true;
    }),

  body("role_id")
    .trim()
    .notEmpty()
    .withMessage("El rol es requerido")
    .isInt({ min: 1, max: 3 })
    .withMessage("El rol debe ser un número entre el 1 y 3"),
];

export const updateValidation = [
  idValidation,

  body("first_name")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres"),

  body("last_name")
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ min: 3, max: 50 })
    .withMessage("El apellido debe tener entre 3 y 50 caracteres"),

  body("email")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe ser un email válido")
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
    }),

  body("password")
    .optional()
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isStrongPassword()
    .withMessage(
      "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
    ),

  body("password_confirmation")
    .optional()
    .notEmpty()
    .withMessage("La confirmación de contraseña es requerida")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Las contraseñas no coinciden");
      }

      return true;
    }),

  body("role_id")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El rol es requerido")
    .isInt({ min: 1, max: 3 })
    .withMessage("El rol debe ser un número entre el 1 y 3"),
];
