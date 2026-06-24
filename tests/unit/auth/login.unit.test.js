
import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: class {
    findByEmail() { return Promise.resolve(null); }
    update() { return Promise.resolve(); }
  }
}));

jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'secret',
      jwtExpiration: '1h',
    }
  }
}));

// Mock bcrypt to avoid actual hashing
jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: () => Promise.resolve('hashed_password'),
    hashSync: () => 'hashed_password', // For DUMMY_HASH
    compare: () => Promise.resolve(false),
  }
}));

// Dynamic import after mocking
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');

describe('loginUser Vulnerability Check', () => {
  it('should return INVALID_CREDENTIALS when user is not found (instead of crashing)', async () => {
    try {
      await loginUser({ email: 'nonexistent@example.com', password: 'password' });
      fail('Should have thrown an error');
    } catch (error) {
      // It should now throw AppError, not TypeError
      // AppError does not set this.name, so it defaults to 'Error'
      expect(error.code).toBe('INVALID_CREDENTIALS');
      expect(error.message).toBe('Credenciales inválidas');
    }
  });
});
