import request from "supertest";
import app from "../../src/app.js";
import pool from "../../src/config/db.js";
import jwt from "jsonwebtoken";
import { config } from "../../src/config/config.js";

describe("Auth Middleware - Token Validation", () => {
  afterAll(async () => {
    await pool.end();
  });

  describe("Invalid Token Scenarios", () => {
    it("should return 401 when no authorization header is provided", async () => {
      const res = await request(app).get("/api/v1/users").expect(401);

      expect(res.body.error.code).toBe("TOKEN_REQUIRED");
      expect(res.body.error.message).toBe("Token requerido");
    });

    it("should return 401 when token is malformed", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", "Bearer invalid_token_format")
        .expect(401);

      expect(res.body.error.code).toBe("TOKEN_INVALID");
      expect(res.body.error.message).toBe("Token inválido o expirado");
    });

    it("should return 401 when token has invalid signature", async () => {
      // Create a token with wrong secret
      const invalidToken = jwt.sign(
        { sub: 1, role_id: 1 },
        "wrong_secret_key",
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${invalidToken}`)
        .expect(401);

      expect(res.body.error.code).toBe("TOKEN_INVALID");
      expect(res.body.error.message).toBe("Token inválido o expirado");
    });

    it("should return 401 when token is expired", async () => {
      // Create an expired token (expired 1 hour ago)
      const expiredToken = jwt.sign(
        { sub: 1, role_id: 1 },
        config.security.jwtSecret,
        { expiresIn: "-1h" }, // Negative expiration = already expired
      );

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(res.body.error.code).toBe("TOKEN_INVALID");
      expect(res.body.error.message).toBe("Token inválido o expirado");
    });

    it("should return 401 when authorization header is missing Bearer prefix", async () => {
      const validToken = jwt.sign(
        { sub: 1, role_id: 1 },
        config.security.jwtSecret,
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", validToken) // Missing "Bearer " prefix
        .expect(401);

      expect(res.body.error.code).toBe("TOKEN_INVALID");
      expect(res.body.error.message).toBe("Token inválido o expirado");
    });
  });

  describe("Valid Token Scenarios", () => {
    it("should accept valid token and pass auth middleware", async () => {
      // Create a valid admin token
      const validToken = jwt.sign(
        { sub: 1, role_id: 1 },
        config.security.jwtSecret,
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${validToken}`);

      // Should not be 401 with TOKEN_INVALID or TOKEN_REQUIRED
      // Will be 200 (success) or other status, but not 401 from auth middleware
      expect(res.status).not.toBe(401);
      if (res.status === 401) {
        // If it is 401, it should not be from auth middleware
        expect(res.body.error.code).not.toBe("TOKEN_INVALID");
        expect(res.body.error.code).not.toBe("TOKEN_REQUIRED");
      }
    });
  });
});
