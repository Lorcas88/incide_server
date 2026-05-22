import { jest } from "@jest/globals";
import BaseModel from "../../../src/core/base.model.js";

describe("BaseModel", () => {
  describe("findOne", () => {
    it("should throw error for invalid condition keys (SQL injection protection)", async () => {
      const model = new BaseModel();
      model.table = "test_table";

      const conditions = { "id = 1 OR 1=1": 1 };

      await expect(model.findOne(conditions)).rejects.toThrow(
        "Invalid column name: id = 1 OR 1=1",
      );
    });

    it("should not throw error for valid condition keys", async () => {
      const model = new BaseModel();
      model.table = "test_table";

      // Mock this.where to prevent actual DB query buildup
      model.where = jest.fn().mockReturnThis();
      model.first = jest.fn().mockResolvedValue({ id: 1, name: "test" });

      const conditions = { valid_key_1: 1 };

      const result = await model.findOne(conditions);
      expect(result).toEqual({ id: 1, name: "test" });
      expect(model.where).toHaveBeenCalledWith(
        "test_table.valid_key_1 = ?",
        [1],
      );
    });
  });
});
