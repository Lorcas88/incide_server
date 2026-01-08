// tests/auth/login.test.js
import request from "supertest";
import app from "../src/app.js";
import User from "../src/modules/users/user.model.js";
import bcrypt from "bcrypt";
import pool from "../src/config/db.js";

describe("POST /api/v1/auth/login", () => {
  const testUser = {
    first_name: "Testo",
    last_name: "Gomez",
    email: "test@gmail.com",
    password: "T3st|ng1234",
    password_confirmation: "T3st|ng1234",
  };
  let token;

  beforeAll(async () => {
    // Limpia la tabla antes de empezar
    await pool.query("TRUNCATE TABLE tickets");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password)
       VALUES (?, ?, ?, ?)`,
      [testUser.first_name, testUser.last_name, testUser.email, hashedPassword]
    );

    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    token = res.body.token;
  });

  afterAll(async () => {
    // Limpia y cierra conexiones
    await pool.query("TRUNCATE TABLE tickets");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");
    await pool.end();
  });

  it("should return 200 and a token for valid credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should return 401 for not existing user", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "noexiste@test.com",
      password: "Password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should return 401 for invalid user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "wrong@example.com", password: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("should return 401 for invalid password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
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
    const res = await request(app).post("/api/v1/auth/register").send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("DUPLICATE_ENTRY");
  });

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

  it("should return 204 for unsuscribing user", async () => {
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

  it("should return 404 for unsuscribing a deleted user", async () => {
    const res = await request(app)
      .delete("/api/v1/auth/unsubscribe")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
