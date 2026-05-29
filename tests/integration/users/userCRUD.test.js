import request from "supertest";
import app from "../../../src/app.js";
import bcrypt from "bcrypt";
import pool from "../../../src/config/db.js";
import { config } from "../../../src/config/config.js";
import { ROLES } from "../../../src/modules/roles/role.constants.js";

describe("User Management Endpoints (Admin Only)", () => {
  const adminUser = {
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    password: "Admin123!",
    role_id: ROLES.ADMIN,
  };

  const regularUser = {
    first_name: "Regular",
    last_name: "User",
    email: "regular@example.com",
    password: "User123!",
    role_id: ROLES.USER,
  };

  let adminToken;
  let userToken;
  let createdUserId;

  beforeAll(async () => {
    // Clean database
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    // Create admin user
    const hashedPasswordAdmin = await bcrypt.hash(adminUser.password, config.security.bcryptRounds);
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        adminUser.first_name,
        adminUser.last_name,
        adminUser.email,
        hashedPasswordAdmin,
        adminUser.role_id,
      ],
    );

    // Create regular user
    const hashedPasswordUser = await bcrypt.hash(regularUser.password, config.security.bcryptRounds);
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        regularUser.first_name,
        regularUser.last_name,
        regularUser.email,
        hashedPasswordUser,
        regularUser.role_id,
      ],
    );

    // Login admin
    const adminLogin = await request(app).post("/api/v1/auth/login").send({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminToken = adminLogin.body.data.token;

    // Login regular user
    const userLogin = await request(app).post("/api/v1/auth/login").send({
      email: regularUser.email,
      password: regularUser.password,
    });
    userToken = userLogin.body.data.token;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");
    await pool.end();
  });

  describe("GET /api/v1/users", () => {
    it("should return all users for admin", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("should deny access for regular user", async () => {
      const res = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/v1/users", () => {
    it("should create a new user as admin", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "New",
          last_name: "Support",
          email: "newsupport@example.com",
          password: "Support123!",
          password_confirmation: "Support123!",
          role_id: ROLES.SUPPORT,
        })
        .expect(201);

      // console.log(res.body.data);
      // createdUserId = res.body.data.id;
      // console.log(createdUserId);

      expect(res.body.data.email).toBe("newsupport@example.com");
      // expect(res.body.data.role).toBe("support");
      createdUserId = res.body.data.id;
    });

    it("should deny user creation for regular user", async () => {
      const res = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          password: "Test123!",
          password_confirmation: "Test123!",
          role_id: ROLES.USER,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return user details for admin", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(createdUserId);
      expect(res.body.data.email).toBe("newsupport@example.com");
    });

    it("should deny access for regular user", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${createdUserId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    it("should update user as admin", async () => {
      const res = await request(app)
        .put(`/api/v1/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          first_name: "Updated",
          last_name: "Support",
        })
        .expect(200);

      expect(res.body.data.first_name).toBe("Updated");
    });

    it("should deny update for regular user", async () => {
      const res = await request(app)
        .put(`/api/v1/users/${createdUserId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          first_name: "Hacked",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should deny delete for regular user", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${createdUserId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("should delete user as admin", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);
    });

    it("should return 404 for deleted user", async () => {
      const res = await request(app)
        .get(`/api/v1/users/${createdUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
