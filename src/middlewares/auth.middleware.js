import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({
      error: {
        code: "TOKEN_REQUIRED",
        message: "Token requerido",
      },
    });

  // To obtain only the token and not the Bearer word included on the request
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.security.jwtSecret);
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({
      error: {
        code: "TOKEN_INVALID",
        message: "Token inválido o expirado",
      },
    });
  }
};
