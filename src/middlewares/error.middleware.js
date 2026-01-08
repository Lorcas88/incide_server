export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Ha ocurrido un error";

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    res.status(status).json({ error: { code, message } });
  } else {
    // Production
    if (err.isOperational) {
      res.status(status).json({ error: { message } });
    } else {
      // Programming or other unknown error: don't leak details
      console.error("ERROR 💥", err);
      res.status(500).json({
        code,
        message: "Ha ocurrido un error",
      });
    }
  }
};
