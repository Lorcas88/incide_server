import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockExecute = jest.fn();
const mockEnd = jest.fn();

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    query: mockQuery,
    execute: mockExecute,
    end: mockEnd,
  },
}));

// Setup env before import
import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const { default: app } = await import("../src/app.js");
const request = (await import("supertest")).default;

describe("Security: XSS Prevention", () => {
  const xssPayload = "<script>alert(1)</script>";
  // Expected escaped payload by validator.escape()
  // < -> &lt;
  // > -> &gt;
  // / -> &#x2F;
  const escapedPayload = "&lt;script&gt;alert(1)&lt;&#x2F;script&gt;";

  beforeEach(() => {
    mockQuery.mockReset();
    mockExecute.mockReset();

    // Setup default behavior
    const handleQuery = async (sql, params) => {
        // SELECT FROM users WHERE email (check existing)
        if (sql.includes("SELECT *") && sql.includes("FROM users") && sql.includes("email =")) {
            return [[]]; // Not found
        }

        // SELECT FROM users WHERE id (find after create)
        if (sql.includes("SELECT users.*, roles.name as role") && sql.includes("WHERE users.id =")) {
            return [[{
                id: 1,
                first_name: escapedPayload,
                last_name: "Smith",
                email: "xss@test.com",
                role_id: 3,
                role: 'user'
            }]];
        }

        return [[]];
    };

    mockQuery.mockImplementation(handleQuery);
    mockExecute.mockImplementation(async (sql, params) => {
        if (sql.includes("INSERT INTO users")) {
            return [{ insertId: 1 }];
        }
        return [{ insertId: 1 }];
    });
  });

  describe("POST /api/v1/auth/register", () => {
    it("should ESCAPE XSS payload before storage", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        first_name: xssPayload,
        last_name: "Smith",
        email: "xss_register@xss.com",
        password: "Password123!",
        password_confirmation: "Password123!",
      });

      expect(res.status).toBe(201);

      // Find the INSERT call in execute
      const insertCall = mockExecute.mock.calls.find(call => call[0].includes("INSERT INTO users"));
      expect(insertCall).toBeDefined();

      const params = insertCall[1];
      // Check that the first parameter (first_name) is EXACTLY the ESCAPED payload
      expect(params[0]).toBe(escapedPayload);
    });

    it("should allow inputs that expand beyond original limit (50) but fit in new limit (100)", async () => {
      // 60 chars of plain text.
      // Previously would fail (max 50 raw).
      // Now should pass (max 100 escaped, and 60 escaped is 60).

      const longName = "A".repeat(60);
      const res = await request(app).post("/api/v1/auth/register").send({
        first_name: longName,
        last_name: "Smith",
        email: "long_name@test.com",
        password: "Password123!",
        password_confirmation: "Password123!",
      });

      expect(res.status).toBe(201);

       // Verify stored value
      const insertCall = mockExecute.mock.calls.find(call => call[0].includes("INSERT INTO users"));
      const params = insertCall[1];
      expect(params[0]).toBe(longName);
    });
  });
});
