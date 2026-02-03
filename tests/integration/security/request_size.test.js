import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";

describe("Security - Request Size Limits", () => {
  afterAll(async () => {
    await pool.end();
  });
  it("should allow small payloads", async () => {
    // Send a login request with a normal payload
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    // We don't care about the actual result (401 or 200), just that it's NOT 413
    expect(res.status).not.toBe(413);
  });

  it("should reject payloads larger than 10kb", async () => {
    // Create a payload larger than 10kb
    // 10kb = 10240 bytes.
    // "a" is 1 byte. We send 11000 characters.
    const largeString = "a".repeat(11000);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: largeString });

    expect(res.status).toBe(413);
    // Express throws "request entity too large" by default for this error
    // The error middleware wraps it, so we check the response structure
    // If it is 413, it will come from the error middleware structure
    // Depending on environment (test/dev vs prod), the structure might vary slightly
    // In test env, it returns code & message.
    expect(res.body.error.message).toBe("request entity too large");
  });
});
