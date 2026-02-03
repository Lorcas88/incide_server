/**
 * Configuration Tests
 *
 * Simple tests to verify the configuration object is properly loaded
 * and has the expected structure from the test environment.
 */

import { config } from "../../../src/config/config.js";

describe("Configuration", () => {
  describe("Environment Detection", () => {
    test("should detect test environment", () => {
      expect(config.env.nodeEnv).toBe("test");
      expect(config.env.isTest).toBe(true);
      expect(config.env.isDevelopment).toBe(false);
      expect(config.env.isProduction).toBe(false);
    });
  });

  describe("Database Configuration", () => {
    test("should have valid database configuration", () => {
      expect(config.db.host).toBeDefined();
      expect(config.db.user).toBeDefined();
      expect(config.db.password).toBeDefined();
      expect(config.db.database).toBeDefined();
      expect(config.db.port).toBeDefined();
      expect(typeof config.db.port).toBe("number");
      expect(config.db.connectionLimit).toBe(10);
    });

    test("should parse DB_PORT as integer", () => {
      expect(typeof config.db.port).toBe("number");
      expect(config.db.port).toBeGreaterThan(0);
    });
  });

  describe("Security Configuration", () => {
    test("should have valid security configuration", () => {
      expect(config.security.jwtSecret).toBeDefined();
      expect(config.security.jwtExpiration).toBeDefined();
      expect(config.security.bcryptRounds).toBeDefined();
      expect(typeof config.security.bcryptRounds).toBe("number");
    });

    test("should parse BCRYPT_ROUNDS as integer", () => {
      expect(typeof config.security.bcryptRounds).toBe("number");
      expect(config.security.bcryptRounds).toBeGreaterThanOrEqual(10);
      expect(config.security.bcryptRounds).toBeLessThanOrEqual(15);
    });

    test("should have JWT_SECRET with minimum length", () => {
      expect(config.security.jwtSecret.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe("CORS Configuration", () => {
    test("should have valid CORS configuration", () => {
      expect(config.cors.origin).toBeDefined();
      expect(config.cors.methods).toEqual(["GET", "POST", "PUT", "DELETE"]);
      expect(config.cors.credentials).toBe(true);
    });
  });

  describe("Cookie Configuration", () => {
    test("should have valid cookie configuration", () => {
      expect(config.cookies.httpOnly).toBe(true);
      expect(config.cookies.sameSite).toBe("lax");
      expect(config.cookies.maxAge).toBeDefined();
    });

    test("should not use secure cookies in test environment", () => {
      expect(config.cookies.secure).toBe(false);
    });
  });

  describe("Email Configuration", () => {
    test("should have email sender configuration", () => {
      expect(config.emailSender).toBeDefined();
      // In test environment, RESEND_API_KEY may be optional
      expect(config.emailSender.resend).toBeDefined();
    });
  });

  describe("Client Configuration", () => {
    test("should have client URL configuration", () => {
      expect(config.client.url).toBeDefined();
      expect(typeof config.client.url).toBe("string");
    });
  });

  describe("Rate Limit Configuration", () => {
    test("should have rate limit configuration", () => {
      expect(config.rateLimit.windowMs).toBeDefined();
      expect(config.rateLimit.max).toBeDefined();
      expect(typeof config.rateLimit.windowMs).toBe("number");
      expect(typeof config.rateLimit.max).toBe("number");
    });
  });
});
