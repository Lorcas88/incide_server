import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockUpdate = jest.fn();

// Mock the Ticket model class
jest.unstable_mockModule('../src/modules/tickets/ticket.model.js', () => {
  return {
    default: class Ticket {
      async find(id) {
        return mockFind(id);
      }
      async update(id, data) {
        return mockUpdate(id, data);
      }
    },
  };
});

// Mock TicketPolicy to always allow
jest.unstable_mockModule('../src/modules/tickets/ticket.policy.js', () => {
  return {
    TicketPolicy: {
      update: () => true,
    },
  };
});

// Import the service dynamically after mocking
const { updateTicket } = await import('../src/modules/tickets/ticket.service.js');
import AppError from '../src/utils/AppError.js';

describe('Security Vulnerability Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should NOT allow updating ticket_status_id via updateTicket service', async () => {
    const user = { id: 1, role_id: 1 }; // Admin
    const ticketId = 1;
    const updateData = {
      title: 'New Title',
      ticket_status_id: 3 // RESOLVED
    };

    // Mock find to return a ticket
    mockFind.mockResolvedValue({
      id: 1,
      title: 'Old Title',
      created_by: 1,
      ticket_status_id: 1 // OPEN
    });

    // Mock update (should not be reached if validation works)
    mockUpdate.mockResolvedValue({ ...updateData, id: 1 });

    await expect(updateTicket(ticketId, updateData, user)).rejects.toThrow(AppError);
    await expect(updateTicket(ticketId, updateData, user)).rejects.toHaveProperty('status', 403);

    // Verify that update was NOT called
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
