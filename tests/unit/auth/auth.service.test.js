import { jest } from '@jest/globals';

// Mock Config
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 1,
      jwtSecret: 'test-secret',
      jwtExpiration: '1h',
    },
  }
}));

// Mock DB to prevent connection attempts
jest.unstable_mockModule('../../../src/config/db.js', () => ({
  default: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

// Mock User model
const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();

jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: class User {
    findByEmail = mockFindByEmail;
    update = mockUpdate;
    withRole() { return this; }
  }
}));

// Import the service under test
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');

describe('Auth Service - Login Vulnerability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw INVALID_CREDENTIALS when user is not found', async () => {
    // Arrange
    mockFindByEmail.mockResolvedValue(null); // User not found

    // Act & Assert
    // Expect AppError with "Credenciales inválidas" instead of TypeError
    await expect(loginUser({ email: 'nonexistent@example.com', password: 'password' }))
      .rejects
      .toThrow('Credenciales inválidas');
  });
});
