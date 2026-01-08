import AppError from "../utils/AppError.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role_id)) {
      throw new AppError("Acceso prohibido", "FORBIDDEN", 403);
    }
    next();
  };
};
