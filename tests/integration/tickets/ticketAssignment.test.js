import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import {
  cleanDatabase,
  createTestUsers,
  createTestTicket,
} from "../../setup/testHelpers.js";

describe("Ticket Assignment Endpoints", () => {
  let adminToken;
  let supportToken;
  let userToken;
  let adminUserId;
  let supportUserId;
  let regularUserId;
  let testTicketId;

  beforeAll(async () => {
    await cleanDatabase();
    const users = await createTestUsers();
    adminToken = users.admin.token;
    supportToken = users.support.token;
    userToken = users.user.token;
    adminUserId = users.admin.user.id;
    supportUserId = users.support.user.id;
    regularUserId = users.user.user.id;

    // Create a test ticket
    const ticket = await createTestTicket({
      created_by: regularUserId,
      title: "Test ticket for assignment",
      description: "This ticket will be assigned",
    });
    testTicketId = ticket.id;
  });

  afterAll(async () => {
    await cleanDatabase();
    await pool.end();
  });

  describe("PATCH /api/v1/tickets/:id/self_assign", () => {
    it("should allow support to self-assign unassigned ticket", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${testTicketId}/self_assign`)
        .set("Authorization", `Bearer ${supportToken}`)
        .expect(200);

      expect(res.body.data.assigned_to).toBe(supportUserId);
    });

    it("should deny self-assign for regular user", async () => {
      // Create another ticket
      const ticket = await createTestTicket({
        created_by: regularUserId,
        title: "Another ticket",
      });

      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket.id}/self_assign`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/v1/tickets/:id/assign", () => {
    it("should allow admin to assign ticket to support", async () => {
      // Create another unassigned ticket
      const ticket = await createTestTicket({
        created_by: adminUserId,
        title: "Admin ticket for assignment",
      });

      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket.id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          assigned_to: supportUserId,
        })
        .expect(200);

      expect(res.body.data.assigned_to).toBe(supportUserId);
    });

    it("should deny assign for support user", async () => {
      // Create another ticket
      const ticket = await createTestTicket({
        created_by: regularUserId,
        title: "Ticket for support assignment test",
      });

      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket.id}/assign`)
        .set("Authorization", `Bearer ${supportToken}`)
        .send({
          assigned_to: supportUserId,
        });

      expect(res.status).toBe(403);
    });
  });
});
