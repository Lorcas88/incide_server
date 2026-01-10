import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import specs from "./config/swagger.js";
import { config } from "./config/config.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";
import userRoutes from "./modules/users/user.routes.js";

const app = express();

// Seguridad HTTP
app.use(helmet());

// Habilitar CORS
app.use(cors(config.cors));

// Cookie Parsing
app.use(cookieParser());

// JSON Parsing
app.use(express.json());

// Rate limit global Aplicar rate limit a todas las rutas
app.use(
  rateLimit({
    windowMs: config.rateLimit.windowMs, // 15 minutos
    max: config.rateLimit.max, // máximo 100 requests por IP en 15 minutos
    standardHeaders: true, // devuelve info en los headers RateLimit-*
    legacyHeaders: false, // desactiva X-RateLimit-* headers antiguos
    message: {
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Has excedido el límite de solicitudes. Intenta más tarde.",
      },
    },
  })
);

// Logging HTTP
app.use(morgan("dev"));

// Documentación Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Rutas API
const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tickets`, ticketRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// Error middleware
app.use(errorHandler);

export default app;
