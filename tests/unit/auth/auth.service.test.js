
import { jest } from "@jest/globals";

// Define mocks
const mockUserFind = jest.fn();
const mockUserFindByEmail = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserCreate = jest.fn();
const mockUserWithRole = jest.fn().mockReturnThis();

// Mock User class
const MockUser = jest.fn().mockImplementation(() => ({
  find: mockUserFind,
  findByEmail: mockUserFindByEmail,
  update: mockUserUpdate,
  create: mockUserCreate,
  withRole: mockUserWithRole,
}));

// Mock bcrypt
const mockCompare = jest.fn();
const mockHash = jest.fn();

// Mock config
const mockConfig = {
  security: {
    jwtSecret: "test-secret",
    jwtExpiration: "1h",
    bcryptRounds: 10,
  },
};

// Setup mocks
jest.unstable_mockModule("../../../src/modules/users/user.model.js", () => ({
  default: MockUser,
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: mockCompare,
    hash: mockHash,
    hashSync: jest.fn().mockReturnValue("dummy_hash"),
  },
}));

jest.unstable_mockModule("../../../src/config/config.js", () => ({
  config: mockConfig,
}));

// Import the service dynamically after mocks are set up
const { loginUser } = await import("../../../src/modules/auth/auth.service.js");

describe("Auth Service - Login Security", () => {
  const lockedUser = {
    id: 1,
    email: "locked@example.com",
    password: "hashed_password",
    failed_login_attempts: 5,
    locked_until: new Date(Date.now() + 1000000), // Locked in future
    email_verified_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return ACCOUNT_LOCKED for wrong password on locked account", async () => {
    mockUserFindByEmail.mockResolvedValue(lockedUser);
    mockCompare.mockResolvedValue(false); // Wrong password

    try {
      await loginUser({ email: "locked@example.com", password: "wrong" });
    } catch (error) {
      expect(error.code).toBe("ACCOUNT_LOCKED");
    }
  });

  it("should return ACCOUNT_LOCKED for correct password on locked account", async () => {
    mockUserFindByEmail.mockResolvedValue(lockedUser);
    mockCompare.mockResolvedValue(true); // Correct password

    try {
      await loginUser({ email: "locked@example.com", password: "correct" });
    } catch (error) {
      expect(error.code).toBe("ACCOUNT_LOCKED");
    }
  });
});
