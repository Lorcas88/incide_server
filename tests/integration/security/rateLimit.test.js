import request from "supertest";
import { jest } from "@jest/globals";

describe("Security - Rate Limiting", () => {
  let app;
  let pool;

  beforeAll(async () => {
    // Enable rate limits for this test suite
    process.env.ENABLE_RATE_LIMITS = "true";

    // Reset modules to ensure app re-initializes with new env
    jest.resetModules();

    // Import app and db dynamically
    const appModule = await import("../../../src/app.js");
    app = appModule.default;

    const dbModule = await import("../../../src/config/db.js");
    pool = dbModule.default;
  });

  afterAll(async () => {
    delete process.env.ENABLE_RATE_LIMITS;
    if (pool) {
      await pool.end();
    }
  });

  it("should enforce rate limit on /register", async () => {
    // Limit is 5. Send 5 requests.
    // We send empty body to trigger validation error (fast) but still count towards limit
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/api/v1/auth/register").send({});
      expect(res.status).not.toBe(429);
    }

    // 6th request should fail with 429
    const res = await request(app).post("/api/v1/auth/register").send({});

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("TOO_MANY_REGISTER_REQUESTS");
  });

  it("should enforce rate limit on /forgot-password", async () => {
    // Limit is 3. Send 3 requests.
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({});
      expect(res.status).not.toBe(429);
    }

    // 4th request should fail with 429
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({});

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("TOO_MANY_FORGOT_PASSWORD_REQUESTS");
  });
});
