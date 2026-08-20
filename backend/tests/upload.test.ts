import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { uploadResume, uploadMiddleware } from '../src/controllers/upload';
import { authenticate } from '../src/middleware/auth';

const app = express();

// Mock authenticate middleware
vi.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user-id' };
    next();
  }
}));

app.post('/api/users/upload-resume', authenticate, (req, res, next) => {
  uploadMiddleware.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadResume);

describe('File Upload API', () => {
  const dummyFilePath = path.join(__dirname, 'dummy.pdf');
  const oversizedFilePath = path.join(__dirname, 'oversize.pdf');
  const maliciousFilePath = path.join(__dirname, 'malicious.exe');

  beforeEach(() => {
    // Create dummy files for testing
    fs.writeFileSync(dummyFilePath, 'dummy pdf content');
    fs.writeFileSync(maliciousFilePath, 'malicious executable');
    
    // Oversized dummy file (just testing limits, supertest might choke on huge files 
    // so we typically mock limits, but we can send a valid one and test the unit filter)
  });

  it('should return 200 and safe filename for valid PDF', async () => {
    const res = await request(app)
      .post('/api/users/upload-resume')
      .attach('file', dummyFilePath);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.filename).toBeDefined();
    expect(res.body.data.filename).toMatch(/\.pdf$/);
    expect(res.body.data.filename).not.toContain('dummy.pdf'); // Security: random UUID instead
  });

  it('should return 400 for invalid file type (e.g. .exe)', async () => {
    const res = await request(app)
      .post('/api/users/upload-resume')
      .attach('file', maliciousFilePath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid file type');
  });

  it('should return 400 if no file is provided', async () => {
    const res = await request(app)
      .post('/api/users/upload-resume');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
