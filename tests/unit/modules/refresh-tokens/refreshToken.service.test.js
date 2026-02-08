import { jest } from "@jest/globals";
import crypto from "crypto";

// Mock dependencies before importing the module under test
jest.unstable_mockModule("../../../../src/modules/refresh-tokens/refreshToken.model.js", () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      markAsUsed: jest.fn(),
      revokeAllForUser: jest.fn(),
      revoke: jest.fn(),
    })),
  };
});

jest.unstable_mockModule("../../../../src/modules/users/user.model.js", () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      find: jest.fn(),
    })),
  };
});

// We need to mock config/db.js because models import it
jest.unstable_mockModule("../../../../src/config/db.js", () => ({
  default: {},
}));

// Mock config to avoid validation errors
jest.unstable_mockModule("../../../../src/config/config.js", () => ({
  config: {
    security: {
      jwtSecret: "secret",
      jwtExpiration: "1h",
    },
  },
}));

describe("RefreshToken Service", () => {
  let refreshTokenService;

  beforeAll(async () => {
    // Import the module under test dynamically after mocking
    refreshTokenService = await import("../../../../src/modules/refresh-tokens/refreshToken.service.js");
  });

  it("should reject refresh request if User-Agent changes", async () => {
    // Let's get the mock class
    const { default: MockRefreshToken } = await import("../../../../src/modules/refresh-tokens/refreshToken.model.js");
    const { default: MockUser } = await import("../../../../src/modules/users/user.model.js");

    // Use the returned object
    const mockInstance = MockRefreshToken.mock.results[0].value;
    const mockUser = MockUser.mock.results[0].value;

    // Setup the scenario
    const rawUA = "Mozilla/5.0 (Original)";
    const differentUA = "Mozilla/5.0 (Evil)";
    const token = "some_valid_token";
    const userId = 1;

    // Simulate hashing in saveToken
    const hashedUA = crypto.createHash("sha256").update(rawUA).digest("hex");

    // Mock findByTokenHash to return a token stored with HASHED User-Agent (as saveToken does now)
    mockInstance.findByTokenHash.mockResolvedValue({
      id: 1,
      user_id: userId,
      token_hash: "hashed_token",
      expires_at: new Date(Date.now() + 10000), // Valid
      user_agent: hashedUA, // Stored as HASH
    });

    mockInstance.markAsUsed.mockResolvedValue(true);
    mockInstance.create.mockResolvedValue(true);

    mockUser.find.mockResolvedValue({
      id: userId,
      role_id: 1
    });

    // Execute refreshToken with DIFFERENT User-Agent
    await expect(refreshTokenService.refreshToken(token, new Date(), "127.0.0.1", differentUA))
      .rejects.toThrow("Refresh token inválido");

    // Verify that revokeAllForUser WAS called
    expect(mockInstance.revokeAllForUser).toHaveBeenCalledWith(userId);
  });
});
