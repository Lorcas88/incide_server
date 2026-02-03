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

// HTTP Security
app.use(helmet());

// Enable CORS
app.use(cors(config.cors));

// Cookie Parsing
app.use(cookieParser());

// JSON Parsing
app.use(express.json({ limit: "10kb" }));

// URL-encoded Parsing
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Global rate limit - Apply rate limit to all routes (skip in test environment)
if (!config.env.isTest) {
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Has excedido el límite de solicitudes. Intenta más tarde.",
        },
      },
    }),
  );
}

// Logging HTTP - Laravel-inspired format
app.use(
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens["response-time"](req, res);

    // Status text with color
    let statusText = "";
    if (status >= 500) {
      statusText = `\x1b[41m ${status} \x1b[0m`; // Red background
    } else if (status >= 400) {
      statusText = `\x1b[43m\x1b[30m ${status} \x1b[0m`; // Yellow background, black text
    } else if (status >= 300) {
      statusText = `\x1b[46m\x1b[30m ${status} \x1b[0m`; // Cyan background, black text
    } else {
      statusText = `\x1b[42m\x1b[30m ${status} \x1b[0m`; // Green background, black text
    }

    // Method color
    const methodColors = {
      GET: "\x1b[36m", // Cyan
      POST: "\x1b[32m", // Green
      PUT: "\x1b[33m", // Yellow
      PATCH: "\x1b[35m", // Magenta
      DELETE: "\x1b[31m", // Red
    };
    const methodColor = methodColors[method] || "\x1b[37m";

    const dots = ".".repeat(Math.max(2, 50 - url.length));

    return `  ${methodColor}${method.padEnd(6)}\x1b[0m \x1b[90m${url}\x1b[0m ${dots} ${statusText} \x1b[90m~ ${responseTime}ms\x1b[0m`;
  }),
);

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// API Routes
const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tickets`, ticketRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// Error middleware
app.use(errorHandler);

export default app;
