import rateLimit from "express-rate-limit";
import { config } from "../config/config.js";

export const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: config.authRateLimit.message,
});
