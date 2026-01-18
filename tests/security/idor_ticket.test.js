import { jest } from '@jest/globals';

// Mock DB pool
const mockQuery = jest.fn();
const mockExecute = jest.fn();

// Mock DB module
jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    query: mockQuery,
    execute: mockExecute,
  },
}));

const { getAllTickets, updateTicket } = await import('../../src/modules/tickets/ticket.service.js');

describe('Ticket Security - IDOR Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const regularUser = { id: 1, role_id: 2 };
  const adminUser = { id: 99, role_id: 1 };
  const otherUser = { id: 2, role_id: 2 };

  test('getAllTickets for regular user filters by user id', async () => {
    // 1. isAdmin check: Role.find(role_id)
    mockQuery.mockResolvedValueOnce([[{ name: 'user' }]]);

    // 2. findAllByUserId: SELECT * FROM tickets WHERE created_by = ?
    mockQuery.mockResolvedValueOnce([
        [{ id: 1, title: 'My Ticket', created_by: 1 }]
    ]);

    const tickets = await getAllTickets(regularUser);

    // Verify role check
    expect(mockQuery).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT * FROM roles'), [regularUser.role_id]);

    // Verify filtering
    expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('WHERE created_by = ?'), [regularUser.id]);

    expect(tickets).toHaveLength(1);
    expect(tickets[0].id).toBe(1);
  });

  test('getAllTickets for admin returns all tickets', async () => {
    // 1. isAdmin check: Role.find(role_id)
    mockQuery.mockResolvedValueOnce([[{ name: 'admin' }]]);

    // 2. all: SELECT * FROM tickets
    mockQuery.mockResolvedValueOnce([
        [{ id: 1 }, { id: 2 }]
    ]);

    const tickets = await getAllTickets(adminUser);

    // Verify role check
    expect(mockQuery).toHaveBeenNthCalledWith(1, expect.stringContaining('SELECT * FROM roles'), [adminUser.role_id]);

    // Verify no filtering
    expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining('SELECT * FROM tickets'));
    expect(tickets).toHaveLength(2);
  });

  test('updateTicket throws Forbidden when accessing other user ticket', async () => {
     // 1. findByIdRaw: SELECT * FROM tickets WHERE id = ?
     mockQuery.mockResolvedValueOnce([[{ id: 10, created_by: 2 }]]); // Ticket owned by user 2

     // 2. isAdmin check
     mockQuery.mockResolvedValueOnce([[{ name: 'user' }]]);

     await expect(updateTicket(10, { title: 'Hacked' }, regularUser))
        .rejects
        .toThrow('No autorizado');

     // Ensure update was NOT called
     expect(mockExecute).not.toHaveBeenCalled();
  });

  test('updateTicket allows owner to update', async () => {
     // 1. findByIdRaw
     mockQuery.mockResolvedValueOnce([[{ id: 10, created_by: 1 }]]); // Ticket owned by user 1

     // 2. isAdmin check
     mockQuery.mockResolvedValueOnce([[{ name: 'user' }]]);

     // 3. update: UPDATE tickets SET ...
     mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);

     // 4. find (return updated): SELECT * FROM tickets WHERE id = ?
     mockQuery.mockResolvedValueOnce([[{ id: 10, created_by: 1, title: 'Updated' }]]);

     await updateTicket(10, { title: 'Updated' }, regularUser);

     expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('UPDATE tickets'), expect.anything());
  });
});
