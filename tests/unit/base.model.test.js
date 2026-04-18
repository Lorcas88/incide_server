import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

const { default: BaseModel } = await import('../../src/core/base.model.js');

class TestModel extends BaseModel {
  static table = 'test_table';
}

describe('BaseModel findOne SQL Injection protection', () => {
  it('should throw an error if condition key is invalid', async () => {
    const model = new TestModel();
    await expect(model.findOne({ "id = 1 OR 1=1 --": 1 })).rejects.toThrow('Invalid condition key: id = 1 OR 1=1 --');
  });

  it('should not throw an error if condition key is valid', async () => {
    const model = new TestModel();
    model.pool.query = jest.fn().mockResolvedValue([[{ id: 1 }]]);
    const result = await model.findOne({ "id": 1, "test_key": "val" });
    expect(result).toEqual({ id: 1 });
  });
});
