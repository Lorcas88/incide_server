import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Ha ocurrido un error";

  // Log error with context
  logger.error({
    message: err.message,
    code,
    status,
    path: req.path,
    method: req.method,
    stack: err.stack,
    userId: req.user?.id,
  });

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    res.status(status).json({ error: { code, message } });
  } else {
    // Production
    if (err.isOperational || err.status < 500 || err.statusCode < 500) {
      res.status(status).json({ error: { message } });
    } else {
      // Programming or other unknown error: don't leak details
      res.status(500).json({
        code,
        message: "Ha ocurrido un error",
      });
    }
  }
};
