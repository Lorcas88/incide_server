class AppError extends Error {
  constructor(message, code, status) {
    super(message);

    this.code = code;
    this.status = status;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
