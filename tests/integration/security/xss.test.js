import { jest } from '@jest/globals';
import pool from '../../../src/config/db.js';

// Mock the services BEFORE importing app
jest.unstable_mockModule('../../../src/modules/auth/auth.service.js', () => ({
  registerUser: jest.fn().mockResolvedValue({
    id: 1,
    first_name: 'Mock',
    last_name: 'User',
    email: 'test@example.com',
    role_id: 3
  }),
  loginUser: jest.fn(),
  getUserById: jest.fn(),
  changeUserPassword: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.unstable_mockModule('../../../src/modules/user-tokens/userToken.service.js', () => ({
  createToken: jest.fn().mockResolvedValue('mock-token'),
  resetPasswordUser: jest.fn(),
  confirmationUser: jest.fn(),
}));

jest.unstable_mockModule('../../../src/modules/refresh-tokens/refreshToken.service.js', () => ({
  saveToken: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllForUser: jest.fn(),
}));

// Dynamic imports
const { registerUser } = await import('../../../src/modules/auth/auth.service.js');
const { default: app } = await import('../../../src/app.js');
const request = (await import('supertest')).default;

describe('Security: XSS Prevention in User Registration', () => {
  afterAll(async () => {
    await pool.end();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sanitize first_name and last_name to prevent XSS', async () => {
    const xssPayload = '<b>Hacker</b>';
    // express-validator escapes / to &#x2F;
    const safePayload = '&lt;b&gt;Hacker&lt;&#x2F;b&gt;';

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        first_name: xssPayload,
        last_name: xssPayload,
        email: 'test@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
      })
      .expect(201);

    // Check what the service received
    expect(registerUser).toHaveBeenCalledTimes(1);
    const serviceCallArgs = registerUser.mock.calls[0][0];

    // In a vulnerable state, these will be the raw payload
    console.log('Received first_name:', serviceCallArgs.first_name);

    // This expectation should FAIL initially
    expect(serviceCallArgs.first_name).toBe(safePayload);
    expect(serviceCallArgs.last_name).toBe(safePayload);
  });
});
