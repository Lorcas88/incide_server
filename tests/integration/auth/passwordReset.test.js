import request from "supertest";
import app from "../../../src/app.js";
import bcrypt from "bcrypt";
import pool from "../../../src/config/db.js";
import crypto from "crypto";

describe("Password Reset Flow", () => {
  const testUser = {
    first_name: "Reset",
    last_name: "Tester",
    email: "reset.tester@example.com",
    password: "OldPassword123!",
  };
  let userId;

  beforeAll(async () => {
    // Clean database
    await pool.query("TRUNCATE TABLE user_tokens");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Create test user with verified email
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, email_verified_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [testUser.first_name, testUser.last_name, testUser.email, hashedPassword],
    );

    userId = result.insertId;
  });

  afterAll(async () => {
    await pool.query("TRUNCATE TABLE user_tokens");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");
    await pool.end();
  });

  describe("Expired Token Handling", () => {
    it("should reject expired reset password token", async () => {
      // Create an expired token manually
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago
      const tokenValue = "expired_reset_token_" + Date.now();
      const tokenHash = crypto
        .createHash("sha256")
        .update(tokenValue)
        .digest("hex");

      await pool.query(
        `INSERT INTO user_tokens (user_id, type, token_hash, expires_at)
         VALUES (?, 'password', ?, ?)`,
        [userId, tokenHash, expiredDate],
      );

      // Try to reset password with expired token
      const res = await request(app).post("/api/v1/auth/reset-password").send({
        token: tokenValue,
        password: "NewPassword123!",
        password_confirmation: "NewPassword123!",
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("TOKEN_EXPIRED");
    });

    it("should successfully reset password with valid token", async () => {
      // Request password reset
      await request(app).post("/api/v1/auth/forgot-password").send({
        email: testUser.email,
      });

      // Get the token from database
      const [tokens] = await pool.query(
        `SELECT token_hash FROM user_tokens 
         WHERE user_id = ? AND type = 'password' 
         ORDER BY created_at DESC LIMIT 1`,
        [userId],
      );

      // For testing, we need to get the plain token (in real scenario it's sent via email)
      // We'll create a new one with a known value
      const resetToken = "valid_reset_token_" + Date.now();
      const tokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      await pool.query(
        `INSERT INTO user_tokens (user_id, type, token_hash, expires_at)
         VALUES (?, 'password', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
        [userId, tokenHash],
      );

      // Reset password
      const res = await request(app).post("/api/v1/auth/reset-password").send({
        token: resetToken,
        password: "NewPassword123!",
        password_confirmation: "NewPassword123!",
      });

      expect(res.status).toBe(200);

      // Verify can login with new password
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "NewPassword123!",
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data).toHaveProperty("token");

      // Update password for cleanup
      testUser.password = "NewPassword123!";
    });

    it("should reject reused reset password token", async () => {
      // Request password reset
      await request(app).post("/api/v1/auth/forgot-password").send({
        email: testUser.email,
      });

      // Create a token
      const resetToken = "reuse_test_token_" + Date.now();
      const tokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      await pool.query(
        `INSERT INTO user_tokens (user_id, type, token_hash, expires_at)
         VALUES (?, 'password', ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
        [userId, tokenHash],
      );

      // Use token once
      const firstRes = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: resetToken,
          password: "AnotherPassword123!",
          password_confirmation: "AnotherPassword123!",
        });

      expect(firstRes.status).toBe(200);

      // Try to reuse the same token
      const secondRes = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: resetToken,
          password: "YetAnotherPassword123!",
          password_confirmation: "YetAnotherPassword123!",
        });

      expect(secondRes.status).toBe(400);
      expect(secondRes.body.error.code).toBe("INVALID_TOKEN");
    });
  });
});
