import { jest } from '@jest/globals';

// Mock User Model
const mockFindByEmail = jest.fn();
const mockUserInstance = {
  findByEmail: mockFindByEmail,
  update: jest.fn(),
};

// Mock User class constructor
jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: jest.fn(() => mockUserInstance),
}));

// Mock bcrypt
jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: jest.fn().mockResolvedValue(false),
    hashSync: jest.fn().mockReturnValue('dummy_hash'),
  },
}));

// Mock config
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test',
      jwtExpiration: '1h',
    },
  },
}));

describe('Auth Service - Security', () => {
  let loginUser;

  beforeAll(async () => {
    // Import the service under test DYNAMICALLY after mocking
    const module = await import('../../../src/modules/auth/auth.service.js');
    loginUser = module.loginUser;
  });

  describe('loginUser', () => {
    it('should not crash and return 401 when user is not found (User Enumeration Protection)', async () => {
      // Arrange
      mockFindByEmail.mockResolvedValue(null);

      // Act & Assert
      // We expect 401 Invalid Credentials to avoid leaking that the user doesn't exist
      // while preventing the crash that would definitely leak it (and cause DoS).
      await expect(loginUser({ email: 'nonexistent@example.com', password: 'password' }))
        .rejects.toMatchObject({
          message: 'Credenciales inválidas',
          status: 401,
        });
    });
  });
});
