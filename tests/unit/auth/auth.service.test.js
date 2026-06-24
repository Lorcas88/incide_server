import { jest } from '@jest/globals';

// Mock config first because it runs on import
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test-secret',
      jwtExpiration: '1h',
    },
  },
}));

// Mock bcrypt
jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
    hashSync: jest.fn(() => 'dummy_hash'),
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
    find() { return this; }
    create() { return this; }
    delete() { return this; }
  },
}));

// Import the service AFTER mocking
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');
import AppError from '../../../src/utils/AppError.js';

describe('Auth Service - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw AppError when user does not exist (Vulnerability Check)', async () => {
    mockFindByEmail.mockResolvedValue(null);

    // This checks if the function throws specifically an AppError with the expected message.
    // If the bug exists (TypeError: Cannot read properties of null), this expectation will fail.
    await expect(loginUser({ email: 'nonexistent@test.com', password: 'password' }))
      .rejects.toThrow('Credenciales inválidas');
  });
});
