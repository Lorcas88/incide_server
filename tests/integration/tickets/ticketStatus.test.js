import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import {
  cleanDatabase,
  createTestUsers,
  createTestTicket,
} from "../../setup/testHelpers.js";

describe("Ticket Status Change Endpoints", () => {
  let adminToken;
  let supportToken;
  let userToken;
  let supportUserId;
  let testTicketId;

  beforeAll(async () => {
    await cleanDatabase();
    const users = await createTestUsers();
    adminToken = users.admin.token;
    supportToken = users.support.token;
    userToken = users.user.token;
    supportUserId = users.support.user.id;

    // Create a test ticket assigned to support
    const ticket = await createTestTicket({
      created_by: users.user.user.id,
      title: "Test ticket for status changes",
      description: "This ticket will have status changes",
      assigned_to: supportUserId,
    });
    testTicketId = ticket.id;
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe("PATCH /api/v1/tickets/:id/change_status", () => {
    it("should allow admin to change ticket status", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${testTicketId}/change_status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ticket_status_id: 2, // IN_PROGRESS
        })
        .expect(200);

      expect(res.body.data.ticket_status_id).toBe(2);
    });

    it("should allow support to change status of assigned ticket", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${testTicketId}/change_status`)
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
        .patch(`/api/v1/tickets/${testTicketId}/change_status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          ticket_status_id: 1,
        });

      expect(res.status).toBe(400);
    });
  });
});
