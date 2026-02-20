import { jest } from '@jest/globals';

// Mocks
jest.unstable_mockModule('../../../src/config/config.js', () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test-secret',
      jwtExpiration: '1h',
    },
  },
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn().mockResolvedValue(false),
    hashSync: jest.fn().mockReturnValue('dummy_hash'),
  },
}));

// Mock User Model
const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();

jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => {
  return {
    default: class User {
      findByEmail = mockFindByEmail;
      update = mockUpdate;
    },
  };
});

// Import service AFTER mocking
const { loginUser } = await import('../../../src/modules/auth/auth.service.js');
const AppError = (await import('../../../src/utils/AppError.js')).default;

describe('loginUser Vulnerability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw AppError(401) when user is not found, but currently crashes with TypeError', async () => {
    mockFindByEmail.mockResolvedValue(null);

    try {
      await loginUser({ email: 'nonexistent@example.com', password: 'password' });
    } catch (error) {
       // If it crashes with TypeError, the test will fail if we expect AppError
       if (error instanceof TypeError) {
           throw new Error('VULNERABILITY CONFIRMED: Crashed with TypeError instead of AppError');
       }
       // Check for expected AppError properties
       // Note: AppError.js might not set this.name = 'AppError', so checking status and code is safer
       if (error.status === 401 && error.code === 'INVALID_CREDENTIALS') {
           return; // Fixed behavior
       }

       console.error('Unexpected error:', error);
       throw error; // Unexpected error
    }
  });
});
