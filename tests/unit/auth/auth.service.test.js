import { jest } from '@jest/globals';

// Mock dependencies
const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();
const mockWithRole = jest.fn();
const mockCreate = jest.fn();
const mockFind = jest.fn();

// Mock User model class
const MockUser = jest.fn().mockImplementation(() => {
  return {
    findByEmail: mockFindByEmail,
    update: mockUpdate,
    withRole: mockWithRole,
    create: mockCreate,
    find: mockFind,
  };
});

// Mock config
const mockConfig = {
  security: {
    bcryptRounds: 10,
    jwtSecret: 'test-secret',
    jwtExpiration: '1h',
  },
  env: {
    isTest: true
  }
};

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: MockUser,
}));

jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: mockConfig,
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hashSync: jest.fn(() => 'dummy_hash'),
    hash: jest.fn(() => Promise.resolve('hashed_password')),
    compare: jest.fn(() => Promise.resolve(false)),
  },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(() => 'mock_token'),
  },
}));

// Import the service under test
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');
const bcrypt = (await import('bcrypt')).default;

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should throw "Credenciales inválidas" instead of crashing when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockFindByEmail.mockResolvedValue(null); // User not found
      bcrypt.compare.mockResolvedValue(false);

      // Act & Assert
      // We expect this to fail (crash) BEFORE the fix, so this test will fail until we fix the code.
      // But we are setting the expectation for the CORRECT behavior.
      await expect(loginUser({ email, password })).rejects.toThrow('Credenciales inválidas');

      // Verify mocks called correctly
      expect(mockFindByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, 'dummy_hash');
    });

    it('should throw "Credenciales inválidas" when password is incorrect', async () => {
      // Arrange
      const email = 'user@example.com';
      const password = 'wrongpassword';
      const user = {
        id: 1,
        email,
        password: 'hashed_password',
        failed_login_attempts: 0
      };

      mockFindByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false); // Password mismatch

      // Act & Assert
      await expect(loginUser({ email, password })).rejects.toThrow('Credenciales inválidas');

      // Verify update called to increment attempts
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
