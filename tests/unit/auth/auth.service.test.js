import { jest } from '@jest/globals';
import AppError from '../../../src/utils/AppError.js';

// Mock Config
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'secret',
      jwtExpiration: '1h',
    },
  },
}));

// Mock User Model
const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();
const mockWithRole = jest.fn();

// Mock User class
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => {
  return {
    default: class User {
      findByEmail = mockFindByEmail;
      update = mockUpdate;
      withRole = mockWithRole;
    },
  };
});

// Import service after mocking
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');

describe('Auth Service - loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not crash when user is not found (email does not exist)', async () => {
    mockFindByEmail.mockResolvedValue(null); // Simulate user not found

    try {
        await loginUser({ email: 'nonexistent@example.com', password: 'password' });
    } catch (error) {
        // We expect AppError with 401
        if (!(error instanceof AppError)) {
            console.error('Caught unexpected error:', error);
            throw error; // Rethrow so test fails with stack trace
        }
        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Credenciales inválidas');
        expect(error.status).toBe(401);
        return;
    }
    throw new Error('Expected loginUser to throw AppError');
  });
});
