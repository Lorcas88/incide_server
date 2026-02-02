import { jest } from '@jest/globals';
import pool from '../../../src/config/db.js';

// Mock the services BEFORE importing app
jest.unstable_mockModule('../../../src/modules/auth/auth.service.js', () => ({
  registerUser: jest.fn().mockResolvedValue({
    id: 1,
    first_name: "O'Connor", // Mock response for valid case
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

  it('should reject names containing HTML tags (XSS attempt)', async () => {
    const xssPayload = '<b>Hacker</b>';

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        first_name: xssPayload,
        last_name: 'User',
        email: 'hacker@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
      })
      .expect(422);

    console.log('Errors:', JSON.stringify(res.body.errors, null, 2));

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some(e => e.message === 'El nombre no puede contener caracteres especiales como < o >')).toBe(true);

    expect(registerUser).not.toHaveBeenCalled();
  });

  it('should allow legitimate names with apostrophes', async () => {
    const validName = "O'Connor";

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        first_name: validName,
        last_name: 'User',
        email: 'oconnor@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
      })
      .expect(201);

    expect(registerUser).toHaveBeenCalledTimes(1);
    const serviceCallArgs = registerUser.mock.calls[0][0];

    // Ensure it was NOT escaped
    expect(serviceCallArgs.first_name).toBe(validName);
  });
});
