import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockPool = {
  query: mockQuery,
  execute: mockQuery,
};

// Mock database connection
jest.unstable_mockModule('../../../src/config/db.js', () => ({
  default: mockPool,
}));

const { default: UserToken } = await import('../../../src/modules/user-tokens/userToken.model.js');

describe('UserToken Model Unit Test', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  it('findByTokenHash should exclude soft-deleted tokens', async () => {
    const model = new UserToken();
    mockQuery.mockResolvedValue([[]]); // Return empty rows

    await model.findByTokenHash('test-hash');

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const sql = mockQuery.mock.calls[0][0];

    // Verify that the query checks for deleted_at IS NULL
    expect(sql).toContain('deleted_at IS NULL');
  });
});
