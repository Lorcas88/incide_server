import request from "supertest";
import express from "express";
import { registerValidation } from "../src/modules/auth/auth.validator.js";
import { storeValidation } from "../src/modules/users/user.validator.js";

const app = express();
app.use(express.json());

// Dummy routes that use the validators
app.post("/test-auth-register", registerValidation, (req, res) => {
  res.json({ first_name: req.body.first_name, last_name: req.body.last_name });
});

app.post("/test-user-store", storeValidation, (req, res) => {
  res.json({ first_name: req.body.first_name, last_name: req.body.last_name });
});

describe("XSS Vulnerability Check", () => {
  // Use a shorter payload to avoid hitting the 50 char limit when escaped
  const maliciousPayload = "<b>Hi</b>";
  // express-validator escape() converts <, >, /, &, ", '
  // < -> &lt;
  // > -> &gt;
  // / -> &#x2F;
  const expectedSanitized = "&lt;b&gt;Hi&lt;&#x2F;b&gt;";

  it("should sanitize input in auth register", async () => {
    const res = await request(app)
      .post("/test-auth-register")
      .send({
        first_name: maliciousPayload,
        last_name: "Doe",
        email: "test@example.com",
        password: "Password123!",
        password_confirmation: "Password123!"
      });

    if (res.status !== 200) {
      console.error("Auth register failed:", JSON.stringify(res.body, null, 2));
    }
    expect(res.status).toBe(200);
    expect(res.body.first_name).toBe(expectedSanitized);
  });

  it("should sanitize input in user store", async () => {
    const res = await request(app)
      .post("/test-user-store")
      .send({
        first_name: maliciousPayload,
        last_name: "Doe",
        email: "test2@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
        role_id: 2
      });

    if (res.status !== 200) {
      console.error("User store failed:", JSON.stringify(res.body, null, 2));
    }
    expect(res.status).toBe(200);
    expect(res.body.first_name).toBe(expectedSanitized);
  });
});
