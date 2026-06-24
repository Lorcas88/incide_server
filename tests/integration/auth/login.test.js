import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import { cleanDatabase, createTestUser } from "../../setup/testHelpers.js";

describe("POST /api/v1/auth/login", () => {
  const testUser = {
    first_name: "Test",
    last_name: "User",
    email: "test@gmail.com",
    password: "T3st|ng1234",
  };
  let token;

  beforeAll(async () => {
    await cleanDatabase();
    await createTestUser({
      ...testUser,
      verified: true,
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    token = res.body.data.token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await pool.end();
  });

  it("should return 200 and a token for valid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("token");
  });

  it("should return 401 for not existing user", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "noexiste@test.com",
      password: "Password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should handle login attempts with non-existent users without throwing 500", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "invalid_user_no_account@test.com",
      password: "Password123",
    });

    // We specifically check it doesn't return 500 (TypeError from accessing locked_until on null)
    expect(res.status).not.toBe(500);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should return 401 for invalid user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "wrong@example.com", password: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should return 401 for invalid password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should not allow login before email confirmation", async () => {
    // Create unverified user
    await createTestUser({
      first_name: "Unconfirmed",
      last_name: "User",
      email: "unconfirmed@test.com",
      password: "Test123!",
      verified: false,
    });

    // Try to login without confirming email
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "unconfirmed@test.com",
      password: "Test123!",
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.error.code).toBe("EMAIL_NOT_VERIFIED");
  });
});
