import request from "supertest";
import app from "../../../src/app.js";
import pool from "../../../src/config/db.js";
import { cleanDatabase } from "../../setup/testHelpers.js";

describe("Security – XSS protection on names", () => {
  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await pool.end();
  });

  it("should reject script injection in first_name", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: "<script>alert(1)</script>",
      last_name: "Perez",
      email: "test@test.com",
      password: "Testing123!",
      password_confirmation: "Testing123!",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].message).toBe("Texto inválido");
  });

  it("should reject script injection in last_name", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: "Juan",
      last_name: "<img src=x onerror=alert(1)>",
      email: "test@test.com",
      password: "Testing123!",
      password_confirmation: "Testing123!",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].message).toBe("Texto inválido");
  });

  it("should reject invalid email format with scripts", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: "Juan",
      last_name: "Perez",
      email: "<script>alert('xss')</script>@test.com",
      password: "Testing123!",
      password_confirmation: "Testing123!",
    });

    expect(res.status).toBe(422);
  });

  it("should reject generic HTML tags in names", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: "<b>Bold</b>",
      last_name: "Perez",
      email: "test@test.com",
      password: "Testing123!",
      password_confirmation: "Testing123!",
    });

    expect(res.status).toBe(422);
  });

  it("should accept valid names", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      first_name: "O'Connor",
      last_name: "Muñoz",
      email: "valid@test.com",
      password: "Testing123!",
      password_confirmation: "Testing123!",
    });

    expect(res.status).toBe(201);
  });
});
