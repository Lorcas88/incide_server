import { jest } from '@jest/globals';

// Mock User model class
const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();

class MockUser {
  findByEmail = mockFindByEmail;
  update = mockUpdate;
}

// Mock modules
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: MockUser
}));

jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test-secret',
      jwtExpiration: '1h'
    }
  }
}));

// Import the service AFTER mocking
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');
const { default: AppError } = await import('../../../src/utils/AppError.js');

describe('loginUser Security Vulnerability Fix Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should NOT throw TypeError when user is not found, but return generic AppError', async () => {
    // Arrange
    const email = 'nonexistent@example.com';
    const password = 'password123';

    // Mock user not found
    mockFindByEmail.mockResolvedValue(null);

    // Act & Assert
    try {
      await loginUser({ email, password });
      fail('Should have thrown an AppError');
    } catch (error) {
      // Verify it is NOT a TypeError
      expect(error).not.toBeInstanceOf(TypeError);

      // Verify it IS an AppError
      expect(error.name).toBe('Error'); // AppError extends Error
      // Or check specific properties if available
      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(error.status).toBe(401);
      expect(error.message).toBe('Credenciales inválidas');
    }
  });
});
