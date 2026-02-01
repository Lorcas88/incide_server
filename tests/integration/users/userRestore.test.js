import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import bcrypt from "bcrypt";

describe("Query Scopes and User Restore", () => {
  let adminToken;
  let adminUser = {
    first_name: "Admin",
    last_name: "User",
    email: "admin@test.com",
    password: "Admin123!",
    role_id: 1,
  };

  let testUserId;

  beforeAll(async () => {
    // Clean up
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        adminUser.first_name,
        adminUser.last_name,
        adminUser.email,
        hashedPassword,
        adminUser.role_id,
      ],
    );

    // Login as admin
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });

    adminToken = loginRes.body.data.token;

    // Create a test user to delete and restore
    const createRes = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        first_name: "Test",
        last_name: "Restore",
        email: "test@restore.com",
        password: "Test123!",
        password_confirmation: "Test123!",
        role_id: 3,
      });

    testUserId = createRes.body.data.id;

    // Verify email for test user (so it can login if needed)
    await pool.query(
      "UPDATE users SET email_verified_at = NOW() WHERE id = ?",
      [testUserId],
    );
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users");
    await pool.query("DELETE FROM user_tokens");
    await pool.end();
  });

  describe("User Restore Endpoint", () => {
    it("should soft delete a user", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      // Verify user is soft deleted
      const [rows] = await pool.query(
        "SELECT deleted_at FROM users WHERE id = ?",
        [testUserId],
      );
      expect(rows[0].deleted_at).not.toBeNull();
    });

    it("should not find soft-deleted user in normal queries", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("should restore a soft-deleted user", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${testUserId}/restore`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", testUserId);
      expect(res.body.data).toHaveProperty("email", "test@restore.com");
      expect(res.body.message).toBe("Usuario restaurado exitosamente");

      // Verify user is restored
      const [rows] = await pool.query(
        "SELECT deleted_at FROM users WHERE id = ?",
        [testUserId],
      );
      expect(rows[0].deleted_at).toBeNull();
    });

    it("should find restored user in normal queries", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", testUserId);
    });

    it("should return 404 when trying to restore non-deleted user", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${testUserId}/restore`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 when trying to restore non-existent user", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/99999/restore`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("should require admin role to restore user", async () => {
      // Create a regular user and get their token
      const userRes = await request(app).post("/api/v1/auth/register").send({
        first_name: "Regular",
        last_name: "User",
        email: "regular@test.com",
        password: "User123!",
        password_confirmation: "User123!",
      });

      // Verify email directly in database (simpler for testing)
      await pool.query(
        "UPDATE users SET email_verified_at = NOW() WHERE id = ?",
        [userRes.body.data.id],
      );

      // Login as regular user
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "regular@test.com",
        password: "User123!",
      });

      const userToken = loginRes.body.data.token;

      // Try to restore with regular user token
      const res = await request(app)
        .patch(`/api/v1/users/${testUserId}/restore`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);

      // Cleanup
      await pool.query("DELETE FROM users WHERE email = ?", [
        "regular@test.com",
      ]);
    });
  });
});
