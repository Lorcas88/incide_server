import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import {
  cleanDatabase,
  createTestUser,
  getAuthToken,
} from "../../setup/testHelpers.js";

describe("Auth Profile Endpoints", () => {
  const testUser = {
    first_name: "Testo",
    last_name: "Gomez",
    email: "test@gmail.com",
    password: "T3st|ng1234",
  };
  let token;

  beforeAll(async () => {
    await cleanDatabase();
    await createTestUser({
      ...testUser,
      verified: true,
    });

    token = await getAuthToken({
      email: testUser.email,
      password: testUser.password,
    });
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return 200 and the user profile", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("test@gmail.com");
    });

    it("should return 200 and all tickets for the user", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("test@gmail.com");
    });
  });

  describe("DELETE /api/v1/auth/unsubscribe", () => {
    it("should return 204 for unsubscribing user", async () => {
      const res = await request(app)
        .delete("/api/v1/auth/unsubscribe")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("should return 404 for querying a deleted user", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 404 for unsubscribing a deleted user", async () => {
      const res = await request(app)
        .delete("/api/v1/auth/unsubscribe")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });
});
