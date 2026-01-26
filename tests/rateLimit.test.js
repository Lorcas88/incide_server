
import { jest } from '@jest/globals';
import request from 'supertest';

// Mock dependencies BEFORE importing app
jest.unstable_mockModule('../src/core/mailer.js', () => ({
  sendForgotEmail: jest.fn().mockResolvedValue({ id: 'mock_email_id' }),
}));

// Mock DB
jest.unstable_mockModule('../src/config/db.js', () => ({
    default: {
        query: jest.fn().mockResolvedValue([[]]), // Returns empty rows for findByEmail (user not found)
        execute: jest.fn().mockResolvedValue([{ insertId: 1 }]),
    }
}));

// Import app after mocks
const app = (await import('../src/app.js')).default;

describe('Rate Limiting', () => {

    it('should limit forgot-password requests', async () => {
        const email = 'test@example.com';
        const endpoint = '/api/v1/auth/forgot-password';

        const requests = [];
        for (let i = 0; i < 5; i++) {
            requests.push(request(app).post(endpoint).send({ email }));
        }

        const responses = await Promise.all(requests);

        // Count 429s
        const tooManyRequests = responses.filter(r => r.status === 429);

        // The limit is 3. We made 5 requests.
        // We expect at least 2 requests to be blocked.
        // Note: Promise.all runs in parallel, but rate limiter usually handles it.
        // If race conditions occur, at least SOME should be blocked.
        expect(tooManyRequests.length).toBeGreaterThanOrEqual(2);
    });
});
