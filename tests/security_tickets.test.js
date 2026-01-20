import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockExecute = jest.fn();

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    query: mockQuery,
    execute: mockExecute,
  }
}));

// Mock auth middleware to bypass real auth logic
jest.unstable_mockModule('../src/middlewares/auth.middleware.js', () => ({
  authMiddleware: (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).send();

    if (auth.includes('USER_A')) {
        req.user = { id: 1, role_id: 2 };
    } else if (auth.includes('USER_B')) {
        req.user = { id: 2, role_id: 2 }; // Regular user
    } else if (auth.includes('ADMIN')) {
        req.user = { id: 99, role_id: 1 }; // Admin
    }
    next();
  }
}));

// Import app dynamically
const { default: app } = await import('../src/app.js');
const request = (await import('supertest')).default;

describe('Security Ticket Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /tickets should return ONLY tickets for User B', async () => {
    // Mock DB returning a ticket belonging to User B
    mockQuery.mockResolvedValue([[{ id: 102, title: "User B Note", created_by: 2 }]]);

    const res = await request(app)
      .get('/api/v1/tickets')
      .set('Authorization', 'Bearer USER_B');

    expect(res.status).toBe(200);

    // Check that findAllByUserId was called (SQL with WHERE created_by = ?)
    expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE created_by = ?'),
        expect.arrayContaining([2])
    );
  });

  it('GET /tickets/:id should 404 for User B accessing User A ticket', async () => {
      // Mock DB returning User A's ticket
      // Note: findRaw calls query, returns result[0].
      // result is [[row]]. So mockResolvedValue([[row]])
      mockQuery.mockResolvedValue([[{ id: 101, title: "User A Secret", created_by: 1 }]]);

      const res = await request(app)
        .get('/api/v1/tickets/101')
        .set('Authorization', 'Bearer USER_B');

      expect(res.status).toBe(404);
  });

  it('GET /tickets should return ALL tickets for Admin', async () => {
      mockQuery.mockResolvedValue([[]]);

      const res = await request(app)
        .get('/api/v1/tickets')
        .set('Authorization', 'Bearer ADMIN');

      expect(res.status).toBe(200);

      // Admin should trigger "SELECT * FROM tickets" without user filter
      // But verify it doesn't have the user filter
      // Note: "SELECT * FROM tickets" is a substring of "SELECT * FROM tickets WHERE ..."
      // So we check arguments.

      // The call for admin is ticketModel.all() -> query(sql) -> no params or different params
      // ticketModel.all() calls: query("SELECT * FROM tickets")
      // ticketModel.findAllByUserId calls: query("... WHERE ...", [id])

      // Check last call or find calls
      const calls = mockQuery.mock.calls;
      const adminCall = calls.find(call => call[0].includes('SELECT * FROM tickets') && !call[0].includes('WHERE created_by'));
      expect(adminCall).toBeDefined();
  });
});
