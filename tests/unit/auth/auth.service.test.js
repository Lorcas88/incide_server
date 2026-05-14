import { jest } from '@jest/globals';

// Mocks
await jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test-secret-at-least-32-chars-long-1234567890',
      jwtExpiration: '1h',
    },
  },
}));

const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();

await jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: class User {
    constructor() {
        this.findByEmail = mockFindByEmail;
        this.update = mockUpdate;
    }
  }
}));

const { loginUser } = await import('../../../src/modules/auth/auth.service.js');
import AppError from '../../../src/utils/AppError.js';

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should throw "Invalid Credentials" when user is not found (and not crash)', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(loginUser({ email: 'nonexistent@example.com', password: 'password' }))
        .rejects.toThrow("Credenciales inválidas");

      expect(mockFindByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });
});
