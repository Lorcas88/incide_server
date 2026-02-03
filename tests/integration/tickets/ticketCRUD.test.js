import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import { cleanDatabase, createTestUsers } from "../../setup/testHelpers.js";

describe("Ticket CRUD Endpoints", () => {
  let adminToken;
  let supportToken;
  let userToken;
  let createdTicketId;

  beforeAll(async () => {
    await cleanDatabase();
    const users = await createTestUsers();
    adminToken = users.admin.token;
    supportToken = users.support.token;
    userToken = users.user.token;
  });

  afterAll(async () => {
    await cleanDatabase();
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
      createdTicketId = res.body.data.id;
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
        .get(`/api/v1/tickets/${createdTicketId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.id).toBe(createdTicketId);
    });

    it("should allow admin to view any ticket", async () => {
      const res = await request(app)
        .get(`/api/v1/tickets/${createdTicketId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(createdTicketId);
    });
  });

  describe("PUT /api/v1/tickets/:id", () => {
    it("should update ticket as admin", async () => {
      const res = await request(app)
        .put(`/api/v1/tickets/${createdTicketId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Updated title",
        })
        .expect(200);

      expect(res.body.data.title).toBe("Updated title");
    });

    it("should deny update for regular user", async () => {
      const res = await request(app)
        .put(`/api/v1/tickets/${createdTicketId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          title: "User update",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/tickets/:id", () => {
    it("should deny delete for support user", async () => {
      const res = await request(app)
        .delete(`/api/v1/tickets/${createdTicketId}`)
        .set("Authorization", `Bearer ${supportToken}`);

      expect(res.status).toBe(403);
    });

    it("should deny delete for regular user", async () => {
      const res = await request(app)
        .delete(`/api/v1/tickets/${createdTicketId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it("should allow admin to delete ticket", async () => {
      const res = await request(app)
        .delete(`/api/v1/tickets/${createdTicketId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
