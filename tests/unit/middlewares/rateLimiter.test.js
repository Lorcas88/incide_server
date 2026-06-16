import { jest } from "@jest/globals";
import rateLimit from "express-rate-limit";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  refreshLimiter,
  resendConfirmationLimiter,
} from "../../../src/middlewares/rateLimiter.middleware.js";

describe("Rate Limiter Middleware", () => {
  it("should define rate limiters correctly", () => {
    expect(loginLimiter).toBeDefined();
    expect(registerLimiter).toBeDefined();
    expect(forgotPasswordLimiter).toBeDefined();
    expect(resetPasswordLimiter).toBeDefined();
    expect(refreshLimiter).toBeDefined();
    expect(resendConfirmationLimiter).toBeDefined();
  });

  it("should bypass rate limiting in test environment", () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    registerLimiter(req, res, next);
    forgotPasswordLimiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
