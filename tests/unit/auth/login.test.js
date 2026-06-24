
import { jest } from '@jest/globals';

// Define mocks
const mockUser = {
  password: 'hashedPassword',
  locked_until: null,
  id: 1,
  email: 'test@example.com',
  role_id: 1,
  email_verified_at: new Date(),
  deleted_at: null,
  failed_login_attempts: 0
};

const mockUserModelInstance = {
  findByEmail: jest.fn(),
  update: jest.fn(),
  withRole: jest.fn().mockReturnThis(),
  find: jest.fn(),
};

const MockUserModel = jest.fn(() => mockUserModelInstance);

// Mock dependencies
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: MockUserModel
}));

jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'secret',
      jwtExpiration: '1h'
    }
  }
}));

const mockBcrypt = {
  hashSync: jest.fn().mockReturnValue('dummy_hash'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(false)
};

jest.unstable_mockModule('bcrypt', () => ({
  default: mockBcrypt
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn().mockReturnValue('mock_token')
  }
}));

// Import the service under test
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');

describe('Auth Service Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Invalid Credentials when logging in with non-existent user (Fixes DoS Crash)', async () => {
    // Setup mock to return null (user not found)
    mockUserModelInstance.findByEmail.mockResolvedValue(null);
    mockBcrypt.compare.mockResolvedValue(false);

    // Expecting AppError with 401
    // We catch the error to inspect properties
    try {
      await loginUser({ email: 'nonexistent@example.com', password: 'password' });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.name).toBe('Error'); // AppError extends Error
      // We check message or code.
      // The original code throws AppError("Credenciales inválidas", "INVALID_CREDENTIALS", 401);
      // Since we didn't mock AppError, it is the real class.
      expect(error.message).toBe("Credenciales inválidas");
      expect(error.status).toBe(401);
    }
  });

  it('should return 403 Account Locked when account is locked', async () => {
    const lockedUser = { ...mockUser, locked_until: new Date(Date.now() + 100000) };
    mockUserModelInstance.findByEmail.mockResolvedValue(lockedUser);
    mockBcrypt.compare.mockResolvedValue(true); // Password correct

    try {
      await loginUser({ email: 'test@example.com', password: 'password' });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe("Cuenta bloqueada. Inténtalo de nuevo más tarde.");
      expect(error.status).toBe(403);
    }
  });

  it('should return 200 and token on successful login', async () => {
    mockUserModelInstance.findByEmail.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(true);

    const result = await loginUser({ email: 'test@example.com', password: 'password' });

    expect(result).toHaveProperty('accessToken', 'mock_token');
    expect(result).toHaveProperty('user_id', 1);
  });
});
