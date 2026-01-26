import { validationResult } from "express-validator";

/**
 * Middleware to handle validation errors from express-validator
 * Returns a 422 status with formatted error messages
 */
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
