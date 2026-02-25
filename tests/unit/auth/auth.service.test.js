import { jest } from '@jest/globals';

// Define mocks first
const mockFindByEmail = jest.fn();

// Mock User model
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: class User {
    findByEmail = mockFindByEmail;
  },
}));

// Mock config
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      jwtSecret: 'test-secret',
      jwtExpiration: '1h',
      bcryptRounds: 10,
    },
  },
}));

// Mock bcrypt
jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hashSync: jest.fn().mockReturnValue('dummy_hash'),
    compare: jest.fn().mockResolvedValue(false), // Password mismatch
  },
}));

// Mock jsonwebtoken
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
  },
}));

// Import the service under test
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 401 when user is not found', async () => {
    // Arrange
    mockFindByEmail.mockResolvedValue(null); // User not found

    // Act & Assert
    await expect(loginUser({ email: 'nonexistent@example.com', password: 'password' }))
      .rejects
      .toMatchObject({
        message: 'Credenciales inválidas',
        code: 'INVALID_CREDENTIALS',
        status: 401
      });
  });
});
