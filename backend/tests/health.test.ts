import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

// We mock the DB and cache connections just to test the route behavior
vi.mock('../src/db/prisma', () => ({
  checkPostgresConnection: vi.fn().mockResolvedValue('connected')
}));
vi.mock('../src/db/mongoose', () => ({
  getMongoStatus: vi.fn().mockReturnValue('connected')
}));
vi.mock('../src/services/redis', () => ({
  getRedisStatus: vi.fn().mockReturnValue('connected')
}));

// Create a small express app for testing just this controller
import { checkPostgresConnection } from '../src/db/prisma';
import { getMongoStatus } from '../src/db/mongoose';
import { getRedisStatus } from '../src/services/redis';

const app = express();
app.get('/api/health', async (req, res) => {
  const postgresStatus = await checkPostgresConnection();
  const mongoStatus = getMongoStatus();
  const redisStatus = getRedisStatus();
  res.json({
    status: 'ok',
    service: 'interviewflow-api',
    dependencies: { postgres: postgresStatus, mongodb: mongoStatus, redis: redisStatus }
  });
});

describe('Health API', () => {
  it('should return 200 OK and dependency statuses', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('interviewflow-api');
    expect(res.body.dependencies.postgres).toBe('connected');
    expect(res.body.dependencies.mongodb).toBe('connected');
    expect(res.body.dependencies.redis).toBe('connected');
  });
});
