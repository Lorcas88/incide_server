import { jest } from '@jest/globals';

// Create mocks for the models
const mockRefreshTokenModel = {
  create: jest.fn(),
  findByTokenHash: jest.fn(),
  markAsUsed: jest.fn(),
  revoke: jest.fn(),
  revokeAllForUser: jest.fn(),
};

const mockUserModel = {
  find: jest.fn(),
};

// Mock the modules BEFORE importing the service under test
jest.unstable_mockModule('../../../src/modules/refresh-tokens/refreshToken.model.js', () => ({
  default: jest.fn(() => mockRefreshTokenModel),
}));

jest.unstable_mockModule('../../../src/modules/users/user.model.js', () => ({
  default: jest.fn(() => mockUserModel),
}));

// We need to import the service AFTER mocking
const { saveToken, refreshToken } = await import('../../../src/modules/refresh-tokens/refreshToken.service.js');
const { hash } = await import('../../../src/utils/utils.js');

describe('RefreshToken Service Security Fix Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saveToken should store HASHED user agent', async () => {
    const ua = 'Chrome/RAW';
    const expectedHash = hash(ua);

    await saveToken(1, new Date(), '127.0.0.1', ua);

    expect(mockRefreshTokenModel.create).toHaveBeenCalledWith(expect.objectContaining({
      user_agent: expectedHash
    }));
  });

  it('refreshToken should validate UA hash and REJECT mismatch', async () => {
    const incomingUA = 'Firefox/DIFFERENT';
    // The token in DB has a different UA hash
    const storedHash = hash('Chrome/ORIGINAL');

    mockRefreshTokenModel.findByTokenHash.mockResolvedValue({
      id: 1,
      user_id: 1,
      expires_at: new Date(Date.now() + 10000),
      user_agent: storedHash,
    });

    mockRefreshTokenModel.markAsUsed.mockResolvedValue(true);
    mockUserModel.find.mockResolvedValue({ id: 1, role_id: 1 });

    // Should REJECT because hashes don't match
    await expect(refreshToken('some_token', new Date(), '127.0.0.1', incomingUA))
      .rejects.toThrow('Refresh token inválido');

    // Should verify it revoked tokens
    expect(mockRefreshTokenModel.revokeAllForUser).toHaveBeenCalledWith(1);
  });

  it('refreshToken should ACCEPT matching UA hash', async () => {
    const ua = 'Chrome/SAME';
    const uaHash = hash(ua);

    mockRefreshTokenModel.findByTokenHash.mockResolvedValue({
      id: 1,
      user_id: 1,
      expires_at: new Date(Date.now() + 10000),
      user_agent: uaHash, // Matches incoming
    });

    mockRefreshTokenModel.markAsUsed.mockResolvedValue(true);
    mockUserModel.find.mockResolvedValue({ id: 1, role_id: 1 });

    // Should resolve
    await expect(refreshToken('some_token', new Date(), '127.0.0.1', ua))
      .resolves.toBeDefined();
  });
});
