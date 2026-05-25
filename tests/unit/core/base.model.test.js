import { jest } from "@jest/globals";
import BaseModel from "../../../src/core/base.model.js";

describe("BaseModel", () => {
  describe("findOne", () => {
    it("should throw an error if condition key is invalid (SQL injection attempt)", async () => {
      // Mock class extending BaseModel to test its methods
      class TestModel extends BaseModel {
        static table = "test_table";
        static fillable = ["name"];
      }

      const testModel = new TestModel();

      // Test with an invalid condition key containing a SQL injection payload
      const conditions = { "id = 1 UNION SELECT * FROM users": 1 };

      await expect(testModel.findOne(conditions)).rejects.toThrow(
        "Invalid condition key: id = 1 UNION SELECT * FROM users"
      );
    });

    it("should not throw an error if condition key is valid", async () => {
      class TestModel extends BaseModel {
        static table = "test_table";
        static fillable = ["name"];
      }

      const testModel = new TestModel();
      // Mock the first method to avoid executing a real query during the unit test
      testModel.first = jest.fn().mockResolvedValue({ id: 1, name: "test" });

      const conditions = { id: 1, user_name: "test" };
      await expect(testModel.findOne(conditions)).resolves.toEqual({ id: 1, name: "test" });

      // Verify `first` was called.
      expect(testModel.first).toHaveBeenCalled();
    });
  });
});
