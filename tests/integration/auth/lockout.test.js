import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import { cleanDatabase, createTestUser } from "../../setup/testHelpers.js";

describe("Account Lockout", () => {
  const testUser = {
    first_name: "Lockout",
    last_name: "Test",
    email: "lockout@test.com",
    password: "Password123!",
  };

  beforeEach(async () => {
    await cleanDatabase();
    await createTestUser({
      ...testUser,
      verified: true,
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await pool.end();
  });

  it("should lockout account after 5 failed attempts", async () => {
    // 5 failed attempts
    for (let i = 0; i < 4; i++) {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "WrongPassword",
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    }

    // 5th attempt - should be locked even with correct password
    const resLocked = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(resLocked.status).toBe(403);
    expect(resLocked.body.error.code).toBe("ACCOUNT_LOCKED");
  });

  it("should reset attempts on successful login", async () => {
    // 3 failed attempts
    for (let i = 0; i < 3; i++) {
      await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "WrongPassword",
      });
    }

    // Successful login
    const resSuccess = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(resSuccess.status).toBe(200);

    // Check DB to ensure attempts are 0
    const [rows] = await pool.query(
      "SELECT failed_login_attempts FROM users WHERE email = ?",
      [testUser.email],
    );
    expect(rows[0].failed_login_attempts).toBe(0);
  });
});
