import request from "supertest";
import app from "../src/app.js";

describe("Server Health Check", () => {
  it("should return 200 OK on /health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  it("should return 404 on unknown route", async () => {
    const res = await request(app).get("/api/v1/unknown");
    expect(res.statusCode).toEqual(404);
  });
});
