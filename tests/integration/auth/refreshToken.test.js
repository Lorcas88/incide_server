import request from "supertest";
import app from "../../../src/app.js";
import bcrypt from "bcrypt";
import pool from "../../../src/config/db.js";
import { config } from "../../../src/config/config.js";
// import jwt from "jsonwebtoken";

describe("Refresh Token Flow", () => {
  const testUser = {
    first_name: "Refresh",
    last_name: "Tester",
    email: "refresh.tester@example.com",
    password: "Password123!",
  };
  let userId;
  let accessToken;
  let refreshTokenCookie;

  beforeAll(async () => {
    // Clean database
    await pool.query("TRUNCATE TABLE refresh_tokens");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    const hashedPassword = await bcrypt.hash(testUser.password, config.security.bcryptRounds);

    // Create test user with verified email
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, email_verified_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [testUser.first_name, testUser.last_name, testUser.email, hashedPassword],
    );

    userId = result.insertId;
  });

  afterAll(async () => {
    await pool.query("TRUNCATE TABLE refresh_tokens");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");
    await pool.end();
  });

  describe("Token Rotation", () => {
    it("should issue refresh token on login", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("token");
      expect(res.headers["set-cookie"]).toBeDefined();

      accessToken = res.body.data.token;
      refreshTokenCookie = res.headers["set-cookie"].find((cookie) =>
        cookie.startsWith("refresh_token="),
      );

      expect(refreshTokenCookie).toBeDefined();
    });

    it("should rotate refresh token on refresh", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", refreshTokenCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("token");

      const newRefreshCookie = res.headers["set-cookie"].find((cookie) =>
        cookie.startsWith("refresh_token="),
      );

      expect(newRefreshCookie).toBeDefined();
      expect(newRefreshCookie).not.toBe(refreshTokenCookie);

      // Update tokens for next tests
      accessToken = res.body.data.token;
      refreshTokenCookie = newRefreshCookie;
    });

    it("should reject old refresh token after rotation", async () => {
      // Get a new token first
      const firstRefresh = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", refreshTokenCookie);

      const oldCookie = refreshTokenCookie;
      refreshTokenCookie = firstRefresh.headers["set-cookie"].find((cookie) =>
        cookie.startsWith("refresh_token="),
      );

      // Try to use the old token
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", oldCookie);

      expect(res.status).toBe(401);
    });
  });

  describe("Token Revocation", () => {
    it("should revoke refresh token on logout", async () => {
      // Login to get fresh tokens
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const cookie = loginRes.headers["set-cookie"].find((c) =>
        c.startsWith("refresh_token="),
      );
      const token = loginRes.body.data.token;

      // Logout
      const logoutRes = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${token}`)
        .set("Cookie", cookie);

      expect(logoutRes.status).toBe(204);

      // Try to refresh with revoked token
      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", cookie);

      expect(refreshRes.status).toBe(401);
    });

    it("should revoke all tokens on logout-all", async () => {
      // Login twice to create two sessions
      const login1 = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const login2 = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const cookie1 = login1.headers["set-cookie"].find((c) =>
        c.startsWith("refresh_token="),
      );
      const cookie2 = login2.headers["set-cookie"].find((c) =>
        c.startsWith("refresh_token="),
      );
      const token1 = login1.body.data.token;

      // Logout all
      const logoutAllRes = await request(app)
        .post("/api/v1/auth/logout-all")
        .set("Authorization", `Bearer ${token1}`);

      expect(logoutAllRes.status).toBe(204);

      // Both tokens should be revoked
      const refresh1 = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", cookie1);

      const refresh2 = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", cookie2);

      expect(refresh1.status).toBe(401);
      expect(refresh2.status).toBe(401);
    });

    it("should revoke all tokens on password change", async () => {
      // Login to get token
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const cookie = loginRes.headers["set-cookie"].find((c) =>
        c.startsWith("refresh_token="),
      );
      const token = loginRes.body.data.token;

      // Change password
      const changeRes = await request(app)
        .put("/api/v1/auth/change-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          old_password: testUser.password,
          new_password: "NewPassword123!",
          password_confirmation: "NewPassword123!",
        });

      expect(changeRes.status).toBe(200);

      // Old refresh token should be revoked
      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", cookie);

      expect(refreshRes.status).toBe(401);

      // Update password for cleanup
      testUser.password = "NewPassword123!";
    });
  });

  describe("Expired Token Handling", () => {
    it("should reject expired refresh token", async () => {
      // Create an expired token manually
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago
      const tokenValue = "expired_test_token_" + Date.now();
      const crypto = await import("crypto");
      const tokenHash = crypto
        .createHash("sha256")
        .update(tokenValue)
        .digest("hex");

      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES (?, ?, ?)`,
        [userId, tokenHash, expiredDate],
      );

      // Try to use expired token
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", `refresh_token=${tokenValue}`);

      expect(res.status).toBe(401);
    });
  });

  describe("Invalid Token Handling", () => {
    it("should reject invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", "refresh_token=invalid_token_12345");

      expect(res.status).toBe(401);
    });

    it("should reject missing refresh token", async () => {
      const res = await request(app).post("/api/v1/auth/refresh");

      expect(res.status).toBe(401);
    });
  });

  describe("Concurrent Token Usage (Reuse Attack Detection)", () => {
    it("should detect and revoke all tokens on concurrent usage attempt", async () => {
      // Login to get a fresh token
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const cookie = loginRes.headers["set-cookie"].find((c) =>
        c.startsWith("refresh_token="),
      );
      const token = loginRes.body.data.token;

      // Simulate two concurrent refresh requests with the same token
      // In a real attack, an attacker would try to use a stolen token
      // while the legitimate user is also using it

      const [firstRefresh, secondRefresh] = await Promise.all([
        request(app).post("/api/v1/auth/refresh").set("Cookie", cookie),
        request(app).post("/api/v1/auth/refresh").set("Cookie", cookie),
      ]);

      // One should succeed (the one that marks it as used first)
      // The other should fail and trigger revocation
      const responses = [firstRefresh, secondRefresh];
      const successCount = responses.filter((r) => r.status === 200).length;
      const failCount = responses.filter((r) => r.status === 401).length;

      // Exactly one should succeed, one should fail
      expect(successCount).toBe(1);
      expect(failCount).toBe(1);

      // The failed one should have REFRESH_TOKEN_REUSE error
      const failedResponse = responses.find((r) => r.status === 401);
      expect(failedResponse.body.error.code).toBe("REFRESH_TOKEN_REUSE");

      // After reuse detection, ALL tokens for the user should be revoked
      // Try to use the new token from the successful refresh
      const successResponse = responses.find((r) => r.status === 200);
      if (successResponse) {
        const newCookie = successResponse.headers["set-cookie"]?.find((c) =>
          c.startsWith("refresh_token="),
        );

        if (newCookie) {
          const thirdRefresh = await request(app)
            .post("/api/v1/auth/refresh")
            .set("Cookie", newCookie);

          // Should be revoked due to reuse detection
          expect(thirdRefresh.status).toBe(401);
        }
      }
    });

    it("should revoke all tokens if IP address changes", async () => {
      // Login with one IP
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .set("X-Forwarded-For", "192.168.1.100")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const cookie = loginRes.headers["set-cookie"].find((c) =>
        c.startsWith("refresh_token="),
      );

      expect(loginRes.status).toBe(200);

      // Try to refresh from different IP
      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", cookie)
        .set("X-Forwarded-For", "10.0.0.50"); // Different IP

      // Should be rejected and all tokens revoked
      expect(refreshRes.status).toBe(401);
      expect(refreshRes.body.error.code).toBe("REFRESH_TOKEN_INVALID");
    });
  });
});
