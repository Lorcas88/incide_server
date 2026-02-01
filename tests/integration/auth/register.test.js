import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import { cleanDatabase } from "../../setup/testHelpers.js";

describe("POST /api/v1/auth/register", () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  it("should return 201 and the user created", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: "Testo",
      last_name: "Gonzalez",
      email: "testo_gonzalez@gmail.com",
      password: "P@ssw0rd",
      password_confirmation: "P@ssw0rd",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("testo_gonzalez@gmail.com");
  });

  it("should return 409 for duplicated user", async () => {
    const testUser = {
      first_name: "Testo",
      last_name: "Gomez",
      email: "test@gmail.com",
      password: "T3st|ng1234",
      password_confirmation: "T3st|ng1234",
    };

    // Create user first time
    await request(app).post("/api/v1/auth/register").send(testUser);

    // Try to create again
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("DUPLICATE_ENTRY");
  });
});
