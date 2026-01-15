import { jest } from '@jest/globals';

// Define mocks
const mockTicketAll = jest.fn();
const mockTicketFindAllByUserId = jest.fn();
const mockRoleFindByName = jest.fn();

// Mock dependencies
await jest.unstable_mockModule('../src/modules/tickets/ticket.model.js', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      all: mockTicketAll,
      findAllByUserId: mockTicketFindAllByUserId,
    })),
  };
});

await jest.unstable_mockModule('../src/modules/roles/role.model.js', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      findByName: mockRoleFindByName,
    })),
  };
});

// Import the module under test
const { getAllTickets } = await import('../src/modules/tickets/ticket.service.js');

describe('Ticket Service Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call findAllByUserId for regular users', async () => {
    // Setup
    const user = { id: 10, role_id: 2 };
    mockRoleFindByName.mockResolvedValue({ id: 1, name: 'admin' }); // Admin is 1
    mockTicketFindAllByUserId.mockResolvedValue([]);

    // Execute
    await getAllTickets(user);

    // Verify
    // Since we are changing the implementation, we expect findByName to be called to check admin role
    expect(mockRoleFindByName).toHaveBeenCalledWith('admin');
    expect(mockTicketFindAllByUserId).toHaveBeenCalledWith(10);
    expect(mockTicketAll).not.toHaveBeenCalled();
  });

  it('should call all for admin users', async () => {
    // Setup
    const user = { id: 5, role_id: 1 };
    mockRoleFindByName.mockResolvedValue({ id: 1, name: 'admin' });
    mockTicketAll.mockResolvedValue([]);

    // Execute
    await getAllTickets(user);

    // Verify
    expect(mockRoleFindByName).toHaveBeenCalledWith('admin');
    expect(mockTicketAll).toHaveBeenCalled();
    expect(mockTicketFindAllByUserId).not.toHaveBeenCalled();
  });
});
