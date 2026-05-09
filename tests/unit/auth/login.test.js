import { jest } from "@jest/globals";

const mockUserModel = {
  findByEmail: jest.fn(),
  update: jest.fn(),
};

// Mock bcrypt
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hashSync: jest.fn().mockReturnValue("dummy_hash"),
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

// Mock jwt
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn().mockReturnValue("test_token"),
    verify: jest.fn(),
  },
}));

// Mock config
jest.unstable_mockModule("../../../src/config/config.js", () => ({
  config: {
    security: {
      bcryptRounds: 10,
      jwtSecret: "test_secret",
      jwtExpiration: "1h",
    },
  },
}));

// Mock User Model
jest.unstable_mockModule("../../../src/modules/users/user.model.js", () => ({
  default: class {
    constructor() {
      return mockUserModel;
    }
  },
}));

describe("Auth Service - Login", () => {
  let loginUser;
  let bcrypt;
  let AppError;

  beforeAll(async () => {
    const authService = await import("../../../src/modules/auth/auth.service.js");
    loginUser = authService.loginUser;

    const bcryptModule = await import("bcrypt");
    bcrypt = bcryptModule.default;

    const AppErrorModule = await import("../../../src/utils/AppError.js");
    AppError = AppErrorModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw INVALID_CREDENTIALS when user does not exist", async () => {
    mockUserModel.findByEmail.mockResolvedValue(null);
    bcrypt.compare.mockResolvedValue(false);

    try {
      await loginUser({ email: "invalid@example.com", password: "password" });
      fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(401);
      expect(error.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("should NOT throw ACCOUNT_LOCKED when user does not exist", async () => {
    mockUserModel.findByEmail.mockResolvedValue(null);
    bcrypt.compare.mockResolvedValue(false);

    try {
      await loginUser({ email: "invalid@example.com", password: "password" });
      fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(401);
      expect(error.code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("should throw ACCOUNT_LOCKED when user exists and is locked", async () => {
    mockUserModel.findByEmail.mockResolvedValue({
      id: 1,
      locked_until: new Date(Date.now() + 10000), // locked in future
    });
    bcrypt.compare.mockResolvedValue(false);

    try {
      await loginUser({ email: "locked@example.com", password: "password" });
      fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.status).toBe(403);
      expect(error.code).toBe("ACCOUNT_LOCKED");
    }
  });
});
