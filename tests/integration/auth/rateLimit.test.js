import request from "supertest";
import pool from "../../../src/config/db.js";

describe("Auth Rate Limiting", () => {
  let app;

  beforeAll(async () => {
    // Enable rate limits for this test suite
    process.env.ENABLE_RATE_LIMITS = 'true';

    // Dynamically import app so that the middleware picks up the environment variable
    // which is evaluated at module load time.
    const mod = await import("../../../src/app.js");
    app = mod.default;
  });

  afterAll(async () => {
    delete process.env.ENABLE_RATE_LIMITS; // Cleanup
    // Attempt to close pool, though it might fail if not connected
    try {
        await pool.end();
    } catch (e) {
        // ignore
    }
  });

  describe("Forgot Password Rate Limiting", () => {
    it("should limit forgot password requests", async () => {
      const email = "rate.limit.test@example.com";

      // Make 3 allowed requests
      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post("/api/v1/auth/forgot-password")
          .send({ email });

        // It should not be 429 yet
        // It might be 500 if DB is down, but that's fine, we check for NOT 429
        expect(res.status).not.toBe(429);
      }

      // 4th request should fail with 429
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email });

      expect(res.status).toBe(429);
      expect(res.body.error.code).toBe("TOO_MANY_FORGOT_REQUESTS");
    });
  });

  describe("Register Rate Limiting", () => {
    it("should limit register requests", async () => {
       // Make 5 allowed requests
      for (let i = 0; i < 5; i++) {
        const res = await request(app)
          .post("/api/v1/auth/register")
          .send({
            first_name: "Test",
            last_name: "User",
            email: `test_rate_${i}@example.com`,
            password: "Password123!",
            password_confirmation: "Password123!"
          });

        expect(res.status).not.toBe(429);
      }

      // 6th request should fail with 429
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
             first_name: "Test",
            last_name: "User",
            email: `test_rate_fail@example.com`,
            password: "Password123!",
            password_confirmation: "Password123!"
        });

      expect(res.status).toBe(429);
      expect(res.body.error.code).toBe("TOO_MANY_REGISTER_ATTEMPTS");
    });
  });
});
