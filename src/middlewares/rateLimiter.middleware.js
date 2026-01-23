import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "Demasiados intentos de inicio de sesión",
    },
  },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    error: {
      code: "TOO_MANY_RESET_REQUESTS",
      message: "Demasiadas solicitudes de recuperación",
    },
  },
});

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: {
      code: "TOO_MANY_REFRESH_ATTEMPTS",
      message: "Demasiados intentos de refresco de sesión",
    },
  },
});
