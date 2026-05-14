import { jest } from '@jest/globals';
import request from 'supertest';

// Mock DB Pool
const mockExecute = jest.fn();
const mockQuery = jest.fn();
const mockPool = {
  execute: mockExecute,
  query: mockQuery,
  createPool: jest.fn(() => mockPool),
};

jest.unstable_mockModule('../../../src/config/db.js', () => ({
  default: mockPool,
}));

// Mock Config
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    db: {},
    server: { port: 3000 },
    security: {
      jwtSecret: 'test-secret',
      jwtExpiration: '1h',
      bcryptRounds: 1,
    },
    cors: { origin: '*' },
    rateLimit: { windowMs: 1000, max: 1000 },
    cookies: { secure: false },
    emailSender: { resend: 'test' },
    client: { url: 'http://localhost' },
  },
}));

// Mock Mailer
jest.unstable_mockModule('../../../src/core/mailer.js', () => ({
  sendConfirmationEmail: jest.fn(),
  sendTicketAssignedEmail: jest.fn(),
  sendTicketStatusChangedEmail: jest.fn(),
  sendForgotEmail: jest.fn(),
}));

// Import app after mocks
const { default: app } = await import('../../../src/app.js');

describe('Security: XSS Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sanitize first_name and last_name during registration', async () => {
    // Shorter payload to pass max:50 validation after escaping (which expands chars)
    const xssPayload = '<script>alert(1)</script>';
    // express-validator escapes / to &#x2F;
    const sanitizedPayload = '&lt;script&gt;alert(1)&lt;&#x2F;script&gt;';

    const userObj = {
      id: 1,
      first_name: sanitizedPayload,
      last_name: 'Doe',
      email: 'test@example.com',
      password: 'hashed',
      role_id: 3,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 1. registerUser -> userModel.findByEmail (check duplicate)
    mockQuery.mockResolvedValueOnce([[]]);

    // 2. registerUser -> userModel.create -> pool.execute (insert)
    mockExecute.mockResolvedValueOnce([{ insertId: 1 }]);

    // 3. registerUser -> userModel.create -> userModel.find (return created)
    mockQuery.mockResolvedValueOnce([[userObj]]);

    // 4. register (controller) -> createToken -> userModel.findByEmail
    mockQuery.mockResolvedValueOnce([[userObj]]);

    // 5. createToken -> userTokenModel.create -> pool.execute
    mockExecute.mockResolvedValueOnce([{ insertId: 1 }]);

    // 6. createToken -> userTokenModel.create -> userTokenModel.find (return created token record)
    mockQuery.mockResolvedValueOnce([[{ id: 1, user_id: 1, type: 'email_verification' }]]);

    const res = await request(app).post('/api/v1/auth/register').send({
      first_name: xssPayload,
      last_name: 'Doe',
      email: 'test@example.com',
      password: 'Password1!',
      password_confirmation: 'Password1!',
    });

    expect(res.status).toBe(201);

    // Verify what was sent to the DB via mockExecute
    const insertCall = mockExecute.mock.calls.find(call => call[0].includes('INSERT INTO users'));
    expect(insertCall).toBeDefined();

    const values = insertCall[1];
    // We expect the name to be sanitized in the values passed to the DB
    // Currently (Before Fix), it will contain xssPayload
    // After Fix, it will contain sanitizedPayload

    // This assertion expects "Success" (sanitized).
    // Since we haven't fixed it, we expect this test to FAIL now.
    expect(values).toContain(sanitizedPayload);
    expect(values).not.toContain(xssPayload);
  });
});
