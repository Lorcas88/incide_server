import { body, param } from "express-validator";
import { validateResult } from "../../middlewares/validation.middleware.js";
import Role from "../roles/role.model.js";

const RoleModel = new Role();

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
    .trim()
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isStrongPassword()
    .withMessage(
      "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
    ),

  body("password_confirmation")
    .trim()
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
    .custom(async (value) => {
      const role = await RoleModel.find(value);
      if (!role) {
        throw new Error("Rol no válido");
      }
      return true;
    }),

  validateResult,
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
    .trim()
    .optional()
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isStrongPassword()
    .withMessage(
      "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo",
    ),

  body("password_confirmation")
    .trim()
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
    .custom(async (value) => {
      const role = await RoleModel.find(value);
      if (!role) {
        throw new Error("Rol no válido");
      }
      return true;
    }),

  validateResult,
];
