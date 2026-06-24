import { jest } from '@jest/globals';

// Mock dependencies
const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();
// Mock class must return an object with the methods
const MockUser = jest.fn().mockImplementation(() => ({
  findByEmail: mockFindByEmail,
  update: mockUpdate,
}));

const mockCompare = jest.fn();
const mockHashSync = jest.fn();

// Mock config
await jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test',
      jwtExpiration: '1h'
    }
  }
}));

// Mock User model
await jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: MockUser
}));

// Mock bcrypt
await jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: mockCompare,
    hashSync: mockHashSync
  }
}));

// Import the service
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');
import AppError from '../../../src/utils/AppError.js';

describe('Auth Service - Login Vulnerability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHashSync.mockReturnValue('dummy_hash');
  });

  it('should return 401 when user does not exist', async () => {
    // Arrange
    mockFindByEmail.mockResolvedValue(null); // User not found
    mockCompare.mockResolvedValue(false); // Password check fails

    const email = 'nonexistent@example.com';
    const password = 'somepassword';

    // Act & Assert
    // This confirms the fix: no crash, but a handled error
    await expect(loginUser({ email, password }))
      .rejects
      .toThrow(AppError);

    try {
      await loginUser({ email, password });
    } catch (error) {
      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(error.status).toBe(401);
    }
  });
});
