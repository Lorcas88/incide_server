import { jest } from '@jest/globals';

const mockAll = jest.fn();
const mockFindByUser = jest.fn();
const mockFind = jest.fn();
const mockFindRaw = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockCreate = jest.fn();
const mockToArray = jest.fn((arr) => arr);

jest.unstable_mockModule('../src/modules/tickets/ticket.model.js', () => {
  return {
    default: class Ticket {
        all = mockAll;
        findByUser = mockFindByUser;
        find = mockFind;
        findRaw = mockFindRaw;
        update = mockUpdate;
        delete = mockDelete;
        create = mockCreate;
        toArray = mockToArray;
    }
  };
});

const { getAllTickets, getTicketById, updateTicket, deleteTicket } = await import('../src/modules/tickets/ticket.service.js');
const { default: AppError } = await import('../src/utils/AppError.js');

describe('Ticket Service Security IDOR', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockToArray.mockImplementation((arr) => arr);
    });

    const adminUser = { id: 100, role_id: 1 };
    const regularUser = { id: 200, role_id: 2 };
    const otherUser = { id: 300, role_id: 2 };

    describe('getAllTickets', () => {
        test('should return all tickets for admin', async () => {
            await getAllTickets(adminUser);
            expect(mockAll).toHaveBeenCalled();
            expect(mockFindByUser).not.toHaveBeenCalled();
        });

        test('should return only user tickets for regular user', async () => {
            await getAllTickets(regularUser);
            expect(mockFindByUser).toHaveBeenCalledWith(regularUser.id);
            expect(mockAll).not.toHaveBeenCalled();
        });
    });

    describe('getTicketById', () => {
        test('should allow access if user is owner', async () => {
            mockFindRaw.mockResolvedValue({ id: 1, created_by: regularUser.id });
            const ticket = await getTicketById(1, regularUser);
            expect(ticket).toBeDefined();
            expect(mockFindRaw).toHaveBeenCalledWith(1);
        });

        test('should allow access if user is admin', async () => {
            mockFindRaw.mockResolvedValue({ id: 1, created_by: otherUser.id });
            const ticket = await getTicketById(1, adminUser);
            expect(ticket).toBeDefined();
        });

        test('should deny access if user is not owner and not admin', async () => {
            mockFindRaw.mockResolvedValue({ id: 1, created_by: otherUser.id });
            await expect(getTicketById(1, regularUser))
                .rejects
                .toThrow("Acceso prohibido");
        });
    });

    describe('updateTicket', () => {
         test('should allow update if user is owner', async () => {
            mockFindRaw.mockResolvedValue({ id: 1, created_by: regularUser.id });
            await updateTicket(1, {}, regularUser);
            expect(mockUpdate).toHaveBeenCalled();
        });

        test('should deny update if user is not owner and not admin', async () => {
            mockFindRaw.mockResolvedValue({ id: 1, created_by: otherUser.id });
             await expect(updateTicket(1, {}, regularUser))
                .rejects
                .toThrow("Acceso prohibido");
        });
    });

    describe('deleteTicket', () => {
         test('should allow delete if user is owner', async () => {
            mockFindRaw.mockResolvedValue({ id: 1, created_by: regularUser.id });
            await deleteTicket(1, regularUser);
            expect(mockDelete).toHaveBeenCalled();
        });

        test('should deny delete if user is not owner and not admin', async () => {
            mockFindRaw.mockResolvedValue({ id: 1, created_by: otherUser.id });
             await expect(deleteTicket(1, regularUser))
                .rejects
                .toThrow("Acceso prohibido");
        });
    });
});
