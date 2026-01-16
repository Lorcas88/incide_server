import { jest } from '@jest/globals';

// Mock models
const mockTicketAll = jest.fn();
const mockTicketFindByCreator = jest.fn();
const mockRoleFind = jest.fn();

jest.unstable_mockModule('../src/modules/tickets/ticket.model.js', () => {
  return {
    default: class Ticket {
      all = mockTicketAll;
      findByCreator = mockTicketFindByCreator;
    }
  };
});

jest.unstable_mockModule('../src/modules/roles/role.model.js', () => {
  return {
    default: class Role {
      find = mockRoleFind;
    }
  };
});

// Import service AFTER mocking
const { getAllTickets } = await import('../src/modules/tickets/ticket.service.js');

describe('Ticket Service Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call all() for admin user', async () => {
    const adminUser = { id: 1, role_id: 1 };
    // Setup mocks
    mockRoleFind.mockResolvedValue({ id: 1, name: 'admin' });
    mockTicketAll.mockResolvedValue(['ticket1', 'ticket2']);

    const result = await getAllTickets(adminUser);

    expect(mockRoleFind).toHaveBeenCalledWith(1);
    expect(mockTicketAll).toHaveBeenCalled();
    expect(mockTicketFindByCreator).not.toHaveBeenCalled();
    expect(result).toEqual(['ticket1', 'ticket2']);
  });

  it('should call findByCreator() for normal user', async () => {
    const normalUser = { id: 2, role_id: 2 };
    // Setup mocks
    mockRoleFind.mockResolvedValue({ id: 2, name: 'user' });
    mockTicketFindByCreator.mockResolvedValue(['ticket3']);

    const result = await getAllTickets(normalUser);

    expect(mockRoleFind).toHaveBeenCalledWith(2);
    expect(mockTicketFindByCreator).toHaveBeenCalledWith(2);
    expect(mockTicketAll).not.toHaveBeenCalled();
    expect(result).toEqual(['ticket3']);
  });
});
