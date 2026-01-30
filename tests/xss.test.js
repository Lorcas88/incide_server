import { jest } from '@jest/globals';

// Mock DB connection to avoid ECONNREFUSED
jest.unstable_mockModule("../src/config/db.js", () => ({
  default: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

// Mock auth service to verify what data it receives
const mockRegisterUser = jest.fn();

jest.unstable_mockModule("../src/modules/auth/auth.service.js", () => ({
  registerUser: mockRegisterUser,
  loginUser: jest.fn(),
  getUserById: jest.fn(),
  changeUserPassword: jest.fn(),
  deleteUser: jest.fn(),
}));

// Mock other dependencies
jest.unstable_mockModule("../src/modules/user-tokens/userToken.service.js", () => ({
  createToken: jest.fn(),
  resetPasswordUser: jest.fn(),
  confirmationUser: jest.fn(),
}));

jest.unstable_mockModule("../src/modules/refresh-tokens/refreshToken.service.js", () => ({
  saveToken: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllForUser: jest.fn(),
}));

// Helper to mock dates in tests if needed (optional)
jest.unstable_mockModule("../src/utils/utils.js", () => ({
  serialize: (data) => data, // Pass through
  addMinutes: jest.fn(),
  addDays: jest.fn(),
  hash: jest.fn(),
}));

const { default: app } = await import("../src/app.js");
const request = (await import("supertest")).default;

describe("XSS Vulnerability Check", () => {
  const xssUser = {
    first_name: "<script>alert('xss')</script>",
    last_name: "Doe",
    email: "xss_test_user@example.com",
    password: "Password123!",
    password_confirmation: "Password123!",
  };

  beforeEach(() => {
    mockRegisterUser.mockReset();
    // Setup default successful response for registerUser
    mockRegisterUser.mockImplementation(async (userData) => {
        return {
            id: 123,
            ...userData,
            role_id: 3
        };
    });
  });

  it("should reproduce XSS vulnerability (missing escaping)", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(xssUser);

    expect(res.status).toBe(201);

    // Check what was passed to the service
    // If validation escaped it, the service should receive the escaped string.
    // If not, it receives the raw string.

    const serviceCallArgs = mockRegisterUser.mock.calls[0][0];

    // NEW EXPECTATION: Secure (escaped)
    const expected = "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;";
    expect(serviceCallArgs.first_name).toBe(expected);
  });
});
