import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 1,
      jwtSecret: 'test_secret',
      jwtExpiration: '1h'
    }
  }
}));

jest.unstable_mockModule('../../../src/utils/AppError.js', () => {
  return {
    __esModule: true,
    default: class AppError extends Error {
      constructor(message, code, statusCode) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
      }
    }
  };
});

// Mock user model
const mockUpdate = jest.fn();
const mockFindByEmail = jest.fn();

jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => {
  return {
    __esModule: true,
    default: class User {
      constructor() {
        this.update = mockUpdate;
        this.findByEmail = mockFindByEmail;
      }
    }
  };
});

describe('auth.service', () => {
  let loginUser;

  beforeAll(async () => {
    // Dynamic import to load mocked dependencies
    const authService = await import('../../../src/modules/auth/auth.service.js');
    loginUser = authService.loginUser;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should throw INVALID_CREDENTIALS for non-existent user instead of TypeError', async () => {
      mockFindByEmail.mockResolvedValue(null);

      const loginPromise = loginUser({ email: 'nonexistent@test.com', password: 'password123' });

      // Expected to fail with a specific application error, not a TypeError
      await expect(loginPromise).rejects.toThrow('Credenciales inválidas');
      await expect(loginPromise).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    });

    it('should throw ACCOUNT_LOCKED if user account is locked', async () => {
      // Mock user object that exists and is locked
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 15);

      mockFindByEmail.mockResolvedValue({
        id: 1,
        email: 'locked@test.com',
        password: await bcrypt.hash('password123', 1),
        locked_until: futureDate
      });

      const loginPromise = loginUser({ email: 'locked@test.com', password: 'password123' });

      await expect(loginPromise).rejects.toThrow('Cuenta bloqueada. Inténtalo de nuevo más tarde.');
      await expect(loginPromise).rejects.toMatchObject({ code: 'ACCOUNT_LOCKED' });
    });
  });
});
