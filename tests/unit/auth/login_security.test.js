
import { jest } from '@jest/globals';

// Mock dependencies to avoid DB connection and config validation issues
jest.unstable_mockModule('../../../src/config/db.js', () => ({
  default: {},
}));

jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test_secret_key_which_is_long_enough',
      jwtExpiration: '1h',
    },
  },
}));

// Mock the User model
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

describe('Vulnerability Check: Login Crash', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('CRITICAL: should not crash when user does not exist', async () => {
    // Arrange
    mockFindByEmail.mockResolvedValue(null); // Simulate user not found

    // Act & Assert
    try {
      await loginUser({ email: 'nonexistent@example.com', password: 'password' });
      throw new Error('Should have thrown an error');
    } catch (error) {
      // Check if it's the expected AppError or the crash (TypeError)
      if (error instanceof TypeError) {
        throw new Error('CRITICAL VULNERABILITY: Server crashed with TypeError accessing properties of null user');
      }

      // We expect "Credenciales inválidas"
      if (error.message !== 'Credenciales inválidas') {
         // If it's not the expected error, rethrow to see what happened
         throw error;
      }
    }
  });
});
