
import { jest } from '@jest/globals';

// Mock the auth service
jest.unstable_mockModule('../src/modules/auth/auth.service.js', () => ({
  registerUser: jest.fn().mockImplementation((userData) => {
    // Return the data as if it was created, so we can inspect it in the response
    return {
      id: 1,
      ...userData,
      // creating other fields expected by controller
      role_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    };
  }),
  createToken: jest.fn(), // Mock createToken to avoid DB calls
  // Mock other exports if necessary
  loginUser: jest.fn(),
  deleteUser: jest.fn(),
  getUserById: jest.fn(),
  changePasswordUser: jest.fn(),
}));

// Mock refreshToken service
jest.unstable_mockModule('../src/modules/refresh-tokens/refreshToken.service.js', () => ({
  createToken: jest.fn(),
  saveToken: jest.fn(),
  revokeToken: jest.fn(),
  revokeAllForUser: jest.fn(),
  refreshToken: jest.fn(),
}));

// Mock userToken service
jest.unstable_mockModule('../src/modules/user-tokens/userToken.service.js', () => ({
  createToken: jest.fn(),
  resetPasswordUser: jest.fn(),
  confirmationUser: jest.fn(),
}));

// Import app AFTER mocking
const { default: app } = await import('../src/app.js');
const request = (await import('supertest')).default;

describe("XSS Vulnerability Check", () => {
  it("should sanitize HTML input in registration", async () => {
    const maliciousPayload = "<b>foo</b>";
    // express-validator escape() converts:
    // < -> &lt;
    // > -> &gt;
    // / -> &#x2F;
    const expectedSanitized = "&lt;b&gt;foo&lt;&#x2F;b&gt;";

    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: maliciousPayload,
      last_name: maliciousPayload,
      email: "xss@test.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    });

    if (res.status === 422) {
      console.error(JSON.stringify(res.body, null, 2));
    }
    expect(res.status).toBe(201);

    // Check that the response contains the sanitized string
    expect(res.body.data.first_name).toBe(expectedSanitized);
    expect(res.body.data.last_name).toBe(expectedSanitized);
  });
});
