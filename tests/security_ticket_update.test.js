import { jest } from '@jest/globals';

// Mock Ticket Model
const mockUpdate = jest.fn();
const mockFind = jest.fn();

// We need to mock the entire class structure
jest.unstable_mockModule('../src/modules/tickets/ticket.model.js', () => {
  return {
    default: class Ticket {
        async find(id) { return mockFind(id); }
        async update(id, data) { return mockUpdate(id, data); }
    }
  };
});

// Mock Ticket Policy
jest.unstable_mockModule('../src/modules/tickets/ticket.policy.js', () => {
  return {
    TicketPolicy: {
        update: jest.fn(() => true),
    }
  };
});

// Mock AppError to avoid issues if used
jest.unstable_mockModule('../src/utils/AppError.js', () => {
    return {
        default: class AppError extends Error {
            constructor(message, code, status) {
                super(message);
                this.statusCode = status;
                this.errorCode = code;
            }
        }
    };
});

// Import the service AFTER mocking
const { updateTicket } = await import('../src/modules/tickets/ticket.service.js');

describe('Security: Ticket Update Mass Assignment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should prevent updating sensitive fields (Fix Verification)', async () => {
        const sensitiveData = {
            title: 'Updated Title',
            ticket_status_id: 3, // RESOLVED
            created_by: 999 // Attacker
        };

        const mockTicket = { id: 1, assigned_to: 2, created_by: 1, ticket_status_id: 1 };
        mockFind.mockResolvedValue(mockTicket);
        // The updated ticket should NOT have sensitive fields changed
        mockUpdate.mockResolvedValue({ ...mockTicket, title: sensitiveData.title });

        const user = { id: 2, role_id: 2 }; // Support agent assigned to ticket

        await updateTicket(1, sensitiveData, user);

        // This assertion confirms the FIX:
        // The service is passing ONLY whitelisted fields to the model.
        expect(mockUpdate).toHaveBeenCalledWith(1, {
            title: 'Updated Title'
        });

        // Ensure sensitive fields are NOT present
        expect(mockUpdate).not.toHaveBeenCalledWith(1, expect.objectContaining({
            ticket_status_id: 3
        }));
        expect(mockUpdate).not.toHaveBeenCalledWith(1, expect.objectContaining({
            created_by: 999
        }));
    });
});
