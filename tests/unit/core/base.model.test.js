import { jest } from '@jest/globals';
import BaseModel from "../../../src/core/base.model.js";

describe("BaseModel", () => {
  describe("findOne", () => {
    it("should throw an error for invalid column names to prevent SQL injection", async () => {
      class TestModel extends BaseModel {
        static get table() {
          return "test_table";
        }
      }

      const model = new TestModel();
      model.pool = { query: jest.fn(), execute: jest.fn() };

      const maliciousConditions = {
        "id = 1 UNION SELECT * FROM users--": 1
      };

      await expect(model.findOne(maliciousConditions)).rejects.toThrow("Invalid column name: id = 1 UNION SELECT * FROM users--");
    });

    it("should not throw an error for valid column names", async () => {
        class TestModel extends BaseModel {
            static get table() {
                return "test_table";
            }
        }

        const model = new TestModel();
        model.first = jest.fn().mockResolvedValue({ id: 1, name: "test" });
        model.pool = { query: jest.fn(), execute: jest.fn() };

        const validConditions = {
            valid_column_1: "test",
            id: 1
        };

        const result = await model.findOne(validConditions);
        expect(result).toEqual({ id: 1, name: "test" });
    });
  });
});
