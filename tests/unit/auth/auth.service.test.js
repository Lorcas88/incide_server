import { jest } from '@jest/globals';

const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();

class MockUser {
  findByEmail = mockFindByEmail;
  update = mockUpdate;
}

const mockCompare = jest.fn();
const mockHashSync = jest.fn(() => 'dummy_hash');

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: mockCompare,
    hashSync: mockHashSync,
  },
}));

jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: MockUser,
}));

jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test-secret',
      jwtExpiration: '1h',
    },
  },
}));

// Import service after mocking
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');
import AppError from "../../../src/utils/AppError.js";

describe('Auth Service Login Vulnerability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Credenciales inválidas when user is not found (handling null user safely)', async () => {
    mockFindByEmail.mockResolvedValue(null);
    mockCompare.mockResolvedValue(false);

    try {
      await loginUser({ email: 'test@example.com', password: 'password' });
      // Should throw AppError
      throw new Error('Should have thrown AppError');
    } catch (error) {
      if (error instanceof TypeError) {
        throw error; // Rethrow TypeError to fail the test (this is the vulnerability)
      }
      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(401);
      expect(error.message).toBe("Credenciales inválidas");
    }
  });
});
