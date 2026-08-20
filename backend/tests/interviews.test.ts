process.env.JWT_SECRET = 'fallback_secret';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { getInterviewById, updateInterview, getInterviews } from '../src/controllers/interview';
import { authenticate } from '../src/middleware/auth';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.get('/api/interviews', authenticate, getInterviews);
app.get('/api/interviews/:id', authenticate, getInterviewById);
app.patch('/api/interviews/:id', authenticate, updateInterview);

vi.mock('../src/db/prisma', () => ({
  default: {
    interview: {
      findFirst: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    }
  },
  checkPostgresConnection: vi.fn()
}));

vi.mock('../src/services/cache', () => ({
  deleteCache: vi.fn(),
  getCache: vi.fn(),
  setCache: vi.fn(),
}));

import prisma from '../src/db/prisma';

describe('Interview & Authorization API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validToken = jwt.sign({ userId: 'USER_A', email: 'a@example.com' }, process.env.JWT_SECRET || 'fallback_secret');

  describe('JWT Verification', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/interviews/123');
      expect(res.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app).get('/api/interviews/123').set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });
  });

  describe('Authorization / IDOR Protection', () => {
    it('User B cannot view User A\'s interview', async () => {
      // Simulate that findFirst with { id: '123', userId: 'USER_A' } returns null because it belongs to User B in reality.
      // The controller strictly queries by id AND userId from the token.
      (prisma.interview.findFirst as any).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/interviews/123')
        .set('Authorization', `Bearer ${validToken}`);

      // The backend simply says "Not found", successfully preventing User A from seeing User B's record.
      expect(res.status).toBe(404);
      expect(prisma.interview.findFirst).toHaveBeenCalledWith({
        where: { id: '123', userId: 'USER_A' }
      });
    });

    it('Ignores client-provided userId spoofing', async () => {
      (prisma.interview.findFirst as any).mockResolvedValue({ id: '123', userId: 'USER_A' });
      (prisma.interview.update as any).mockResolvedValue({ id: '123', title: 'Hacked' });

      // Attacker tries to pass a different userId in the body
      const res = await request(app)
        .patch('/api/interviews/123')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Hacked', userId: 'USER_B_SPOOFED' });

      // Controller must completely ignore body.userId and use token userId
      expect(prisma.interview.findFirst).toHaveBeenCalledWith({
        where: { id: '123', userId: 'USER_A' } // Still queries using USER_A from token
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Database Ordering', () => {
    it('should return interviews in descending creation order', async () => {
      const mockInterviews = [
        { id: '2', title: 'B', createdAt: new Date('2024-02-01') },
        { id: '1', title: 'A', createdAt: new Date('2024-01-01') }
      ];
      (prisma.interview.findMany as any).mockResolvedValue(mockInterviews);

      const res = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(prisma.interview.findMany).toHaveBeenCalledWith({
        where: { userId: 'USER_A' },
        orderBy: { createdAt: 'desc' }
      });
      expect(res.body.data[0].id).toBe('2');
      expect(res.body.data[1].id).toBe('1');
    });
  });
});
