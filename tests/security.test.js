import { jest } from '@jest/globals';

// Mock the database pool
const mockPool = {
  query: jest.fn(),
  execute: jest.fn(),
  end: jest.fn(),
};

// Use unstable_mockModule to mock the ESM module
jest.unstable_mockModule('../src/config/db.js', () => ({
  default: mockPool,
}));

// Import dependencies AFTER mocking
const { default: app } = await import('../src/app.js');
const request = (await import('supertest')).default;

describe("Security Tests: XSS Prevention", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should sanitize user input during registration to prevent Stored XSS", async () => {
    // Use a shorter payload to avoid hitting the 50 char limit after escaping
    const xssPayload = "<script>a</script>";
    const sanitizedPayload = "&lt;script&gt;a&lt;&#x2F;script&gt;";

    // Mock DB responses
    mockPool.query.mockResolvedValue([[]]); // findByEmail (user doesn't exist)

    // We mock execute to return an insertId.
    // We don't really care about the subsequent 'find' call failing or succeeding for this specific verification,
    // as long as we can inspect the 'execute' call.
    mockPool.execute.mockResolvedValue([{ insertId: 1 }]);

    // Mock the final find call to return a dummy user so the controller doesn't crash
    mockPool.query.mockResolvedValueOnce([[]]) // findByEmail
                  .mockResolvedValueOnce([[{ id: 1, email: "xss_test@example.com" }]]); // find (after create)

    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: `John${xssPayload}`,
      last_name: `Doe${xssPayload}`,
      email: "xss_test@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
    });

    // If the test fails here, it might be because of DB mock issues causing 500s.
    // But our goal is to check if the validator sanitized the input.

    // Retrieve the arguments passed to pool.execute
    const executeCalls = mockPool.execute.mock.calls;

    // Filter for the INSERT call
    const insertCall = executeCalls.find(call => call[0].includes("INSERT INTO users"));

    if (!insertCall) {
        // If we didn't reach DB insert, maybe validation failed?
        console.log("Response body:", res.body);
        throw new Error("DB Insert was not called");
    }

    const values = insertCall[1];

    // Find the first name in values
    const firstNameSent = values.find(v => typeof v === 'string' && v.startsWith("John"));
    const lastNameSent = values.find(v => typeof v === 'string' && v.startsWith("Doe"));

    // Expectation:
    // BEFORE FIX: firstNameSent should contain <script>
    // AFTER FIX: firstNameSent should contain &lt;script&gt;

    // Since this is the REPRO test, we expect it to fail if we assert it IS sanitized.
    // So we assert that it IS sanitized, and we expect this test run to FAIL.

    expect(firstNameSent).toBe(`John${sanitizedPayload}`);
    expect(lastNameSent).toBe(`Doe${sanitizedPayload}`);
  });
});
