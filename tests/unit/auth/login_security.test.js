import { jest } from '@jest/globals';
import AppError from '../../../src/utils/AppError.js';

// Mock dependencies
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      findByEmail: jest.fn().mockResolvedValue(null), // User not found
      withRole: jest.fn().mockReturnThis(),
      find: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    })),
  };
});

jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test-secret',
      jwtExpiration: '1h',
    },
  },
}));

jest.unstable_mockModule('../../../src/config/db.js', () => ({}));

// Import the service under test
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');

describe('loginUser Security Vulnerability Fix Verification', () => {
  it('should return 401 Invalid Credentials instead of crashing when user is not found', async () => {
    try {
      await loginUser({
        email: 'nonexistent@example.com',
        password: 'password'
      });
      fail('Should have thrown an error');
    } catch (error) {
      // Verify it's NOT a TypeError (crash)
      expect(error).not.toBeInstanceOf(TypeError);

      // Verify it IS an AppError (secure handled error)
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe("Credenciales inválidas");
      expect(error.code).toBe("INVALID_CREDENTIALS");
      expect(error.status).toBe(401);
    }
  });
});
