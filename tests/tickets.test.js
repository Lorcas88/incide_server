import request from "supertest";
import app from "../src/app.js";
import bcrypt from "bcrypt";
import pool from "../src/config/db.js";
import { ROLES } from "../src/modules/roles/role.constants.js";

describe("Ticket Endpoints", () => {
  const adminUser = {
    first_name: "Admin",
    last_name: "Tester",
    email: "admin.tester@example.com",
    password: "Password123!",
    role_id: ROLES.ADMIN,
  };

  const supportUser = {
    first_name: "Support",
    last_name: "Tester",
    email: "support.tester@example.com",
    password: "Password123!",
    role_id: ROLES.SUPPORT,
  };

  const regularUser = {
    first_name: "Regular",
    last_name: "User",
    email: "user.tester@example.com",
    password: "Password123!",
    role_id: ROLES.USER,
  };

  let adminToken;
  let supportToken;
  let userToken;
  let supportUserId;

  beforeAll(async () => {
    // Clean tables before starting
    await pool.query("TRUNCATE TABLE tickets");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    // Create admin user
    const hashedPasswordAdmin = await bcrypt.hash(adminUser.password, 10);
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

    // Create support user
    const hashedPasswordSupport = await bcrypt.hash(supportUser.password, 10);
    const [supportResult] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role_id, email_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        supportUser.first_name,
        supportUser.last_name,
        supportUser.email,
        hashedPasswordSupport,
        supportUser.role_id,
      ],
    );
    supportUserId = supportResult.insertId;

    // Create regular user
    const hashedPasswordUser = await bcrypt.hash(regularUser.password, 10);
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

    // Login support
    const supportLogin = await request(app).post("/api/v1/auth/login").send({
      email: supportUser.email,
      password: supportUser.password,
    });
    supportToken = supportLogin.body.data.token;

    // Login regular user
    const userLogin = await request(app).post("/api/v1/auth/login").send({
      email: regularUser.email,
      password: regularUser.password,
    });
    userToken = userLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean and close connections
    await pool.query("TRUNCATE TABLE tickets");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");
    await pool.end();
  });

  describe("POST /api/v1/tickets", () => {
    it("should create a ticket as regular user", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "Login issue",
          description: "Cannot login to the application",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Login issue");
    });

    it("should create a ticket as admin", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Admin ticket",
          description: "Admin created ticket",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Admin ticket");
    });

    it("should deny ticket creation for support user", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${supportToken}`)
        .send({
          title: "Support ticket",
          description: "Support cannot create",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/tickets/created_by", () => {
    it("should return tickets created by user", async () => {
      const res = await request(app)
        .get("/api/v1/tickets/created_by")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/tickets/:id", () => {
    it("should return ticket detail for owner", async () => {
      const res = await request(app)
        .get("/api/v1/tickets/1")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.id).toBe(1);
    });

    it("should allow admin to view any ticket", async () => {
      const res = await request(app)
        .get("/api/v1/tickets/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(1);
    });
  });

  describe("PUT /api/v1/tickets/:id", () => {
    it("should update ticket as admin", async () => {
      const res = await request(app)
        .put("/api/v1/tickets/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Updated title",
        })
        .expect(200);

      expect(res.body.data.title).toBe("Updated title");
    });

    it("should deny update for regular user", async () => {
      const res = await request(app)
        .put("/api/v1/tickets/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "User update",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/tickets/:id/self_assign", () => {
    it("should allow support to self-assign unassigned ticket", async () => {
      const res = await request(app)
        .patch("/api/v1/tickets/1/self_assign")
        .set("Authorization", `Bearer ${supportToken}`)
        .expect(200);

      expect(res.body.data.assigned_to).toBe(supportUserId);
    });

    it("should deny self-assign for regular user", async () => {
      const res = await request(app)
        .patch("/api/v1/tickets/1/self_assign")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/tickets/:id/assign", () => {
    it("should allow admin to assign ticket to support", async () => {
      const res = await request(app)
        .patch("/api/v1/tickets/2/assign")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          assigned_to: supportUserId,
        })
        .expect(200);

      expect(res.body.data.assigned_to).toBe(supportUserId);
    });

    it("should deny assign for support user", async () => {
      const res = await request(app)
        .patch("/api/v1/tickets/2/assign")
        .set("Authorization", `Bearer ${supportToken}`)
        .send({
          assigned_to: supportUserId,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/tickets/:id/change_status", () => {
    it("should allow admin to change ticket status", async () => {
      const res = await request(app)
        .patch("/api/v1/tickets/1/change_status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ticket_status_id: 2, // IN_PROGRESS
        })
        .expect(200);

      expect(res.body.data.ticket_status_id).toBe(2);
    });

    it("should allow support to change status of assigned ticket", async () => {
      const res = await request(app)
        .patch("/api/v1/tickets/1/change_status")
        .set("Authorization", `Bearer ${supportToken}`)
        .send({
          ticket_status_id: 3, // RESOLVED
        })
        .expect(200);

      expect(res.body.data.ticket_status_id).toBe(3);
    });

    it("should deny invalid status transition", async () => {
      // Try to go from RESOLVED (3) to OPEN (1) - invalid
      const res = await request(app)
        .patch("/api/v1/tickets/1/change_status")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ticket_status_id: 1,
        });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/tickets/:id", () => {
    it("should allow admin to delete ticket", async () => {
      const res = await request(app)
        .delete("/api/v1/tickets/2")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);
    });

    it("should deny delete for support user", async () => {
      const res = await request(app)
        .delete("/api/v1/tickets/1")
        .set("Authorization", `Bearer ${supportToken}`);

      expect(res.status).toBe(403);
    });

    it("should deny delete for regular user", async () => {
      const res = await request(app)
        .delete("/api/v1/tickets/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
