process.env.JWT_SECRET = 'fallback_secret';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { generateQuestions } from '../src/controllers/interview';
import { authenticate } from '../src/middleware/auth';
import { validate } from '../src/middleware/validate';
import { generateQuestionsInputSchema } from '../src/utils/aiValidation';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/api/interviews/:id/generate-questions', authenticate, validate(generateQuestionsInputSchema), generateQuestions);

vi.mock('../src/db/prisma', () => ({
  default: {
    interview: {
      findFirst: vi.fn().mockResolvedValue({ id: '123', userId: 'USER_A' }),
    }
  },
  checkPostgresConnection: vi.fn()
}));

vi.mock('../src/services/ai', () => ({
  generateInterviewQuestions: vi.fn()
}));

import { generateInterviewQuestions } from '../src/services/ai';

describe('AI Endpoint API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validToken = jwt.sign({ userId: 'USER_A', email: 'a@example.com' }, process.env.JWT_SECRET || 'fallback_secret');

  describe('Input Validation Boundaries', () => {
    it('should reject count > 10', async () => {
      const res = await request(app)
        .post('/api/interviews/123/generate-questions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ role: 'Dev', difficulty: 'medium', count: 11 }); // Malicious/excessive input

      expect(res.status).toBe(400); // Validation failure
      expect(generateInterviewQuestions).not.toHaveBeenCalled();
    });

    it('should reject invalid difficulty', async () => {
      const res = await request(app)
        .post('/api/interviews/123/generate-questions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ role: 'Dev', difficulty: 'impossible', count: 5 });

      expect(res.status).toBe(400); 
    });
  });

  describe('LLM Mock Integration', () => {
    it('should return successfully generated questions deterministically', async () => {
      const mockQuestions = {
        questions: [{ question: 'Test?', category: 'Tech', difficulty: 'medium' }]
      };
      (generateInterviewQuestions as any).mockResolvedValue(mockQuestions);

      const res = await request(app)
        .post('/api/interviews/123/generate-questions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ role: 'Dev', difficulty: 'medium', count: 1 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockQuestions);
    });

    it('should handle LLM failure safely', async () => {
      (generateInterviewQuestions as any).mockRejectedValue(new Error('LLM Provider Timeout'));

      const res = await request(app)
        .post('/api/interviews/123/generate-questions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ role: 'Dev', difficulty: 'medium', count: 5 });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('LLM Provider Timeout');
    });
  });
});
