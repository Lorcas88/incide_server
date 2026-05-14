import { jest } from "@jest/globals";
import BaseModel from "../../../src/core/base.model.js";

jest.unstable_mockModule("../../../src/config/db.js", () => ({
  default: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

class TestModel extends BaseModel {
  static table = "test_table";
}

describe("BaseModel - Security", () => {
  let model;

  beforeEach(() => {
    model = new TestModel();
    model.pool = {
      query: jest.fn(),
      execute: jest.fn()
    };
  });

  describe("findOne SQL Injection protection", () => {
    it("should allow valid column names", async () => {
      // Mock first() to resolve correctly
      model.first = jest.fn().mockResolvedValue({ id: 1, name: "Test" });

      const result = await model.findOne({ id: 1, first_name: "Test" });

      expect(model._wheres.length).toBeGreaterThan(0);
      expect(model._wheres).toContain("test_table.id = ?");
      expect(model._wheres).toContain("test_table.first_name = ?");
      expect(result).toEqual({ id: 1, name: "Test" });
    });

    it("should reject malicious column names (SQL Injection)", async () => {
      // Create conditions with a malicious key
      const maliciousConditions = {
        "id = 1 OR 1=1; --": 1
      };

      await expect(model.findOne(maliciousConditions)).rejects.toThrow(/Invalid column name/);
      expect(model._wheres).not.toContain("test_table.id = 1 OR 1=1; -- = ?");
    });
  });
});
