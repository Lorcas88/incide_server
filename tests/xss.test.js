import { jest } from "@jest/globals";
import request from "supertest";

// Mock database to prevent connection errors
jest.unstable_mockModule("../src/config/db.js", () => ({
  default: {
    query: jest.fn(),
    execute: jest.fn(),
    end: jest.fn(),
  },
}));

// Mock auth service to capture the input data
const mockRegisterUser = jest.fn();
jest.unstable_mockModule("../src/modules/auth/auth.service.js", () => ({
  registerUser: mockRegisterUser,
  loginUser: jest.fn(),
  getUserById: jest.fn(),
  changeUserPassword: jest.fn(),
  deleteUser: jest.fn(),
}));

// Mock user token service
jest.unstable_mockModule("../src/modules/user-tokens/userToken.service.js", () => ({
  createToken: jest.fn(),
  resetPasswordUser: jest.fn(),
  confirmationUser: jest.fn(),
}));

// Mock refresh token service
jest.unstable_mockModule("../src/modules/refresh-tokens/refreshToken.service.js", () => ({
  saveToken: jest.fn(),
  refreshToken: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllForUser: jest.fn(),
}));

// Import app after mocking
const { default: app } = await import("../src/app.js");

describe("XSS Vulnerability", () => {
  const xssPayload = "<script>alert('xss')</script>";
  const xssUser = {
    first_name: xssPayload,
    last_name: "XSS-Tester",
    email: "xss@example.com",
    password: "P@ssw0rd123!",
    password_confirmation: "P@ssw0rd123!",
  };

  beforeEach(() => {
    mockRegisterUser.mockClear();
    // Setup mock behavior
    mockRegisterUser.mockImplementation((data) => {
      // Return data as if user was created
      return {
        id: 1,
        ...data,
        role_id: 3
      };
    });
  });

  it("should sanitize XSS payload in registration", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(xssUser);

    expect(res.status).toBe(201);

    // Check what was passed to registerUser
    const receivedData = mockRegisterUser.mock.calls[0][0];

    // We expect the payload to be sanitized (Secure behavior)
    const sanitizedPayload = "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;";
    expect(receivedData.first_name).toBe(sanitizedPayload);
  });
});
