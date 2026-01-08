class AppError extends Error {
  constructor(message, status, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = status;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
