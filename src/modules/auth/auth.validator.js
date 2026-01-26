import { body } from "express-validator";
import { validateResult } from "../../middlewares/validation.middleware.js";

// Validation rules for user registration
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

  validateResult,
];

// Validation rules for user login
export const loginValidation = [
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

  body("password").notEmpty().withMessage("La contraseña es requerida"),

  validateResult,
];

// Validation rules for password change
export const changePasswordValidation = [
  body("old_password")
    .notEmpty()
    .withMessage("La antigua contraseña es requerida"),

  body("new_password")
    .trim()
    .notEmpty()
    .withMessage("La nueva contraseña es requerida")
    .isStrongPassword()
    .withMessage(
      "La nueva contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
    ),

  body("password_confirmation")
    .notEmpty()
    .withMessage("La confirmación de contraseña es requerida")
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error("Las contraseñas no coinciden");
      }

      return true;
    }),

  validateResult,
];

// Validation rules for forgot password
export const forgotPasswordValidation = [
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

  validateResult,
];

// Validation rules for password reset
export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("El token es requerido"),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("La nueva contraseña es requerida")
    .isStrongPassword()
    .withMessage(
      "La nueva contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
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

  validateResult,
];
