import { jest } from '@jest/globals';

const mockFindByEmail = jest.fn();
const mockUpdate = jest.fn();

jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => {
  return {
    default: class User {
      findByEmail = mockFindByEmail;
      update = mockUpdate;
    }
  };
});

jest.unstable_mockModule('../../../src/config/config.js', () => {
    return {
        config: {
            security: {
                bcryptRounds: 1,
                jwtSecret: "secret",
                jwtExpiration: "1h"
            }
        }
    }
});

describe('auth.service', () => {
  let authService;

  beforeAll(async () => {
    authService = await import('../../../src/modules/auth/auth.service.js');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should throw an error with INVALID_CREDENTIALS when user does not exist without throwing TypeError', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(authService.loginUser({ email: 'notfound@example.com', password: 'password123' }))
        .rejects
        .toThrow('Credenciales inválidas');

      expect(mockFindByEmail).toHaveBeenCalledWith('notfound@example.com');
    });
  });
});
