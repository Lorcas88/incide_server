import { registerValidation } from "../../../src/modules/auth/auth.validator.js";
import { jest } from "@jest/globals";

describe("Auth Validator XSS Reproduction", () => {
  it("should sanitize first_name and last_name", async () => {
    const req = {
      body: {
        first_name: "<script>alert(1)</script>",
        last_name: "<b>Bold</b>",
        email: "test@example.com",
        password: "Password1!",
        password_confirmation: "Password1!",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    const next = jest.fn();

    // Run each middleware in the chain
    for (const middleware of registerValidation) {
        await middleware(req, res, next);
    }

    // Vulnerability fixed if input is escaped
    expect(req.body.first_name).toBe("&lt;script&gt;alert(1)&lt;&#x2F;script&gt;");
    expect(req.body.last_name).toBe("&lt;b&gt;Bold&lt;&#x2F;b&gt;");

    // Ensure validation passed (next was called)
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(422);
  });
});
