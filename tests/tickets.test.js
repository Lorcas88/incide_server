import request from "supertest";
import app from "../src/app.js";
import bcrypt from "bcrypt";
import pool from "../src/config/db.js";

describe("Ticket Endpoints", () => {
  const testUser = {
    first_name: "Ticket",
    last_name: "Tester",
    email: "ticket.tester@example.com",
    password: "Password123!",
  };
  let token;

  beforeAll(async () => {
    // Limpia la tabla antes de empezar
    await pool.query("TRUNCATE TABLE tickets");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER TABLE users AUTO_INCREMENT = 1");

    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Crear usuario para las pruebas
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, password)
       VALUES (?, ?, ?, ?)`,
      [testUser.first_name, testUser.last_name, testUser.email, hashedPassword]
    );

    // Login para obtener token
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
    // No cerramos el pool aquí si otros tests lo usan, pero Jest corre en paralelo/aislado
    // En este setup compartido, mejor cerrarlo para evitar open handles
    await pool.end();
  });

  it("should return 201 and the ticket created", async () => {
    const res = await request(app)
      .post("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Problemas en login",
        description: "Se presentan problemas en iniciar sesión en Aplicación",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Problemas en login");
  });

  it("should return 200 and all the tickets of a user", async () => {
    const res = await request(app)
      .get("/api/v1/tickets")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return 200 and the detail of a ticket of a user", async () => {
    const res = await request(app)
      .get("/api/v1/tickets/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.id).toBe(1);
  });

  it("should return 200 and the detail of a ticket updated", async () => {
    const res = await request(app)
      .put("/api/v1/tickets/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ticket_status_id: 2,
      })
      .expect(200);

    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.id).toBe(1);
  });

  it("should return 204 and the ticket deleted", async () => {
    const res = await request(app)
      .delete("/api/v1/tickets/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
});
