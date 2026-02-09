import rateLimit from "express-rate-limit";

// Bypass rate limiting in test environment
const isTesting = process.env.NODE_ENV === "test";

const createLimiter = (options) => {
  return isTesting ? (req, res, next) => next() : rateLimit(options);
};

export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "Demasiados intentos de inicio de sesión",
    },
  },
});

export const resetPasswordLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    error: {
      code: "TOO_MANY_RESET_REQUESTS",
      message: "Demasiadas solicitudes de recuperación",
    },
  },
});

export const refreshLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: "TOO_MANY_REFRESH_ATTEMPTS",
      message: "Demasiados intentos de refresco de sesión",
    },
  },
});

export const resendConfirmationLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    error: {
      code: "TOO_MANY_CONFIRMATION_REQUESTS",
      message: "Demasiadas solicitudes de reenvío de confirmación",
    },
  },
});
