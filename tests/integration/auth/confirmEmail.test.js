import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import { cleanDatabase } from "../../setup/testHelpers.js";

describe("POST /api/v1/auth/confirm-email", () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await pool.end();
  });

  it("should confirm user email with valid token", async () => {
    // Register a new user
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      first_name: "Test",
      last_name: "User",
      email: "confirm@test.com",
      password: "Test123!",
      password_confirmation: "Test123!",
    });

    expect(registerRes.status).toBe(201);
    const userId = registerRes.body.data.id;
    const verificationToken = registerRes.body.data.verification_token;

    expect(verificationToken).toBeDefined();

    // Confirm email with the token
    const confirmRes = await request(app)
      .post("/api/v1/auth/confirm-email")
      .send({ token: verificationToken });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.message).toBe("Usuario confirmado");

    // Verify that email_verified_at is now set
    const [userRows] = await pool.query(
      "SELECT email_verified_at FROM users WHERE id = ?",
      [userId],
    );
    expect(userRows[0].email_verified_at).not.toBeNull();

    // Verify user can now login
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "confirm@test.com",
      password: "Test123!",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data).toHaveProperty("token");
  });

  it("should return 400 for invalid token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/confirm-email")
      .send({ token: "invalid_token_12345" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_TOKEN");
  });

  it("should return 400 for expired token", async () => {
    // Register a new user
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      first_name: "Expired",
      last_name: "Token",
      email: "expired@test.com",
      password: "Test123!",
      password_confirmation: "Test123!",
    });

    const userId = registerRes.body.data.id;
    const verificationToken = registerRes.body.data.verification_token;

    // Manually expire the token by updating expires_at to the past
    await pool.query(
      "UPDATE user_tokens SET expires_at = DATE_SUB(NOW(), INTERVAL 1 HOUR) WHERE user_id = ? AND type = 'email_verification'",
      [userId],
    );

    // Try to confirm with expired token
    const confirmRes = await request(app)
      .post("/api/v1/auth/confirm-email")
      .send({ token: verificationToken });

    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.error.code).toBe("TOKEN_EXPIRED");
  });

  it("should return 400 when trying to confirm already verified email", async () => {
    // Register and confirm a user
    const registerRes = await request(app).post("/api/v1/auth/register").send({
      first_name: "Already",
      last_name: "Verified",
      email: "verified@test.com",
      password: "Test123!",
      password_confirmation: "Test123!",
    });

    const verificationToken = registerRes.body.data.verification_token;

    // First confirmation (should succeed)
    await request(app)
      .post("/api/v1/auth/confirm-email")
      .send({ token: verificationToken });

    // Try to confirm again (should fail)
    const secondConfirmRes = await request(app)
      .post("/api/v1/auth/confirm-email")
      .send({ token: verificationToken });

    expect(secondConfirmRes.status).toBe(400);
    expect(secondConfirmRes.body.error.code).toBe("INVALID_TOKEN");
  });
});
