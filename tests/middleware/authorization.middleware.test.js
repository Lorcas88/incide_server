import request from "supertest";
import app from "../../src/app.js";
import pool from "../../src/config/db.js";
import jwt from "jsonwebtoken";
import { config } from "../../src/config/config.js";
import bcrypt from "bcrypt";

describe("Authorization Middleware - Role-Based Access Control", () => {
  let adminUserId, supportUserId, regularUserId;

  beforeAll(async () => {
    // Clean up
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    // Create admin user
    const hashedPassword = await bcrypt.hash("Test123!", config.security.bcryptRounds);
    const [adminResult] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ["Admin", "User", "admin@test.com", hashedPassword, 1],
    );
    adminUserId = adminResult.insertId;

    // Create support user
    const [supportResult] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ["Support", "User", "support@test.com", hashedPassword, 2],
    );
    supportUserId = supportResult.insertId;

    // Create regular user
    const [regularResult] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ["Regular", "User", "regular@test.com", hashedPassword, 3],
    );
    regularUserId = regularResult.insertId;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users");
    await pool.end();
  });

  describe("Admin-Only Endpoints", () => {
    it("should allow admin to access admin-only endpoint", async () => {
      const adminToken = jwt.sign(
        { sub: adminUserId, role_id: 1 },
        config.security.jwtSecret,
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it("should return 403 when support user tries to access admin-only endpoint", async () => {
      const supportToken = jwt.sign(
        { sub: supportUserId, role_id: 2 },
        config.security.jwtSecret,
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${supportToken}`)
        .expect(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
      expect(res.body.error.message).toBe("Acceso prohibido");
    });

    it("should return 403 when regular user tries to access admin-only endpoint", async () => {
      const regularToken = jwt.sign(
        { sub: regularUserId, role_id: 3 },
        config.security.jwtSecret,
        { expiresIn: "1h" },
      );

      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${regularToken}`)
        .expect(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
      expect(res.body.error.message).toBe("Acceso prohibido");
    });
  });
});
