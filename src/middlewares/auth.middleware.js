import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import AppError from "../utils/AppError.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) throw new AppError("Token requerido", "TOKEN_REQUIRED", 401);

  try {
    const payload = jwt.verify(token, config.security.jwtSecret);
    // const user = await userService.getById(payload.sub);
    // if (!user) {
    //   throw new AppError("Unauthorized", 401);
    // }

    req.user = { id: payload.sub, role_id: payload.role_id };
    next();
  } catch {
    throw new AppError("Token inválido o expirado", "TOKEN_INVALID", 401);
  }
};
