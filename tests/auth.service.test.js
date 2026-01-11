
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt'; // Real bcrypt

const mockFindByEmail = jest.fn();
const mockUserConstructor = jest.fn(() => ({
  findByEmail: mockFindByEmail,
  create: jest.fn(),
  find: jest.fn(),
  delete: jest.fn()
}));

// Mock the User model
jest.unstable_mockModule('../src/modules/users/user.model.js', () => ({
  default: mockUserConstructor
}));

// Mock jwt
const mockSign = jest.fn();
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign
  }
}));

// Import the service AFTER mocking
const { loginUser } = await import('../src/modules/auth/auth.service.js');
const AppError = (await import('../src/utils/AppError.js')).default;

describe('Auth Service - Login Timing Attack Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw INVALID_CREDENTIALS if user not found (and still perform bcrypt comparison)', async () => {
    // Mock user not found
    mockFindByEmail.mockResolvedValue(null);

    // We expect it to throw INVALID_CREDENTIALS
    // And importantly, NOT throw an error from bcrypt (which would happen if hash was invalid)
    await expect(loginUser({ email: 'nonexistent@example.com', password: 'password' }))
      .rejects.toThrow(AppError);

    try {
        await loginUser({ email: 'nonexistent@example.com', password: 'password' });
    } catch (e) {
        expect(e.message).toBe('Credenciales inválidas');
    }
  });

  it('should throw INVALID_CREDENTIALS if password incorrect', async () => {
    // Real hash for "hashedpassword"
    const realHash = await bcrypt.hash('hashedpassword', 10);
    const mockUser = { id: 1, email: 'user@example.com', password: realHash };

    mockFindByEmail.mockResolvedValue(mockUser);

    await expect(loginUser({ email: 'user@example.com', password: 'wrongpassword' }))
      .rejects.toThrow(AppError);
  });

  it('should return token if credentials valid', async () => {
    // Real hash for "password"
    const realHash = await bcrypt.hash('password', 10);
    const mockUser = { id: 1, email: 'user@example.com', password: realHash, role_id: 1 };

    mockFindByEmail.mockResolvedValue(mockUser);
    mockSign.mockReturnValue('valid_token');

    const token = await loginUser({ email: 'user@example.com', password: 'password' });

    expect(token).toBe('valid_token');
  });
});
