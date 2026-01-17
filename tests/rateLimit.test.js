import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the auth controller to avoid DB connections and isolate rate limit testing
jest.unstable_mockModule('../src/modules/auth/auth.controller.js', () => ({
  login: (req, res) => res.status(200).json({ ok: true }),
  register: (req, res) => res.status(201).json({ ok: true }),
  me: jest.fn(),
  destroy: jest.fn(),
  logout: jest.fn(),
}));

// Import app dynamically after mocking
const { default: app } = await import('../src/app.js');

describe('Auth Rate Limiting', () => {
  it('should allow requests within the limit', async () => {
    // Limit is 5. We send 3.
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      // If validation fails it might return 422, but rate limit should still count.
      // Since we mocked controller, if validation passes, it returns 200.
      // If validation fails, it returns 422.
      // Rate limit runs BEFORE validation?
      // In auth.routes.js: router.post("/login", authLimiter, loginValidation, login);
      // Yes, limiter is first.

      expect(res.status).not.toBe(429);
    }
  });

  it('should block requests exceeding the limit', async () => {
    // The limit is global for the IP in the test environment (using memory store by default).
    // Previous test consumed 3 requests. Limit is 5.
    // So 2 more should succeed.

    for (let i = 0; i < 2; i++) {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password' });
      expect(res.status).not.toBe(429);
    }

    // The 6th request (total) should fail
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe("TOO_MANY_REQUESTS");
  });
});
