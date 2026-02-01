import request from "supertest";
import app from "../../src/app.js";
import pool from "../../src/config/db.js";

describe("Validation Middleware - Input Validation", () => {
  afterAll(async () => {
    await pool.end();
  });

  it("should return 422 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        // Missing required fields
        email: "test@test.com",
      })
      .expect(422);

    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("should return 422 when email format is invalid", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        first_name: "Test",
        last_name: "User",
        email: "invalid-email",
        password: "Test123!",
        password_confirmation: "Test123!",
      })
      .expect(422);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some((err) => err.field === "email")).toBe(true);
  });

  it("should return 422 when passwords don't match", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        first_name: "Test",
        last_name: "User",
        email: "test@test.com",
        password: "Test123!",
        password_confirmation: "DifferentPassword123!",
      })
      .expect(422);

    expect(res.body.errors).toBeDefined();
  });
});
