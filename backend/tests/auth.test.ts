process.env.JWT_SECRET = 'fallback_secret';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { register, login } from '../src/controllers/auth';
import { validate } from '../src/middleware/validate';
import { registerSchema, loginSchema } from '../src/utils/validation';

const app = express();
app.use(express.json());
app.post('/api/auth/register', validate(registerSchema), register);
app.post('/api/auth/login', validate(loginSchema), login);

vi.mock('../src/db/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  },
  checkPostgresConnection: vi.fn()
}));

import prisma from '../src/db/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 on successful registration', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: '1',
        name: 'Test',
        email: 'test@example.com'
        // Mock does not return password
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.password).toBeUndefined(); // Ensure password not leaked
    });

    it('should return 409 if email already exists', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: '1' });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!'
      });

      expect(res.status).toBe(409);
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      });

      expect(res.status).toBe(400); // Validation error
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return token and set HttpOnly cookie on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: '1',
        name: 'Test',
        email: 'test@example.com',
        password: hashedPassword
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
      
      const cookies = res.headers['set-cookie'];
      expect(cookies[0]).toMatch(/token=.*HttpOnly/);
    });

    it('should return 401 for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: '1',
        password: hashedPassword
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(res.status).toBe(401);
    });
  });
});
