import { jest } from '@jest/globals';
import BaseModel from '../../../src/core/base.model.js';
import pool from '../../../src/config/db.js';

class TestModel extends BaseModel {
  static get table() { return 'test_table'; }
  static get softDelete() { return true; }
}

describe('BaseModel findOne', () => {
  let model;

  beforeEach(() => {
    model = new TestModel();
    model.first = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should accept valid column names', async () => {
    await model.findOne({ valid_column_1: 'value' });
    expect(model._wheres).toContain('test_table.valid_column_1 = ?');
    expect(model._bindings).toContain('value');
  });

  it('should throw an error for invalid column names', async () => {
    await expect(model.findOne({ 'invalid column': 'value' })).rejects.toThrow('Invalid column name: invalid column');
    await expect(model.findOne({ 'invalid; --': 'value' })).rejects.toThrow('Invalid column name: invalid; --');
    await expect(model.findOne({ 'invalid\'': 'value' })).rejects.toThrow('Invalid column name: invalid\'');
  });
});
