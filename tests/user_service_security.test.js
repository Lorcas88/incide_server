
import { jest } from '@jest/globals';

const mockFind = jest.fn();
const mockUpdate = jest.fn();

class MockUser {
  find(id) { return mockFind(id); }
  update(id, data) { return mockUpdate(id, data); }
}

jest.unstable_mockModule('../src/modules/users/user.model.js', () => ({
  default: MockUser,
}));

jest.unstable_mockModule('../src/modules/roles/role.model.js', () => ({
  default: class MockRole {},
}));

const { updateUser } = await import('../src/modules/users/user.service.js');

describe('User Service Security', () => {
    beforeEach(() => {
        mockFind.mockClear();
        mockUpdate.mockClear();
    });

    it('should hash password when updating user', async () => {
        const userId = 1;
        const plainPassword = 'plainPassword123';

        mockFind.mockResolvedValue({ id: userId, email: 'test@example.com' });
        mockUpdate.mockResolvedValue({ id: userId });

        await updateUser(userId, { password: plainPassword });

        const updateCallArgs = mockUpdate.mock.calls[0];
        const updateData = updateCallArgs[1];

        // Should not be plain text
        expect(updateData.password).not.toBe(plainPassword);
        // Should be a bcrypt hash (starts with $2b$)
        expect(updateData.password).toMatch(/^\$2b\$/);
    });

    it('should normalize email when updating user', async () => {
        const userId = 1;
        const mixedCaseEmail = '  TestUser@Example.COM  ';

        mockFind.mockResolvedValue({ id: userId, email: 'old@example.com' });
        mockUpdate.mockResolvedValue({ id: userId });

        await updateUser(userId, { email: mixedCaseEmail });

        const updateCallArgs = mockUpdate.mock.calls[0];
        const updateData = updateCallArgs[1];

        expect(updateData.email).toBe('testuser@example.com');
    });
});
