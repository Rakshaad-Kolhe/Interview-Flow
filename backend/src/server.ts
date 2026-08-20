import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/errorHandler';
import { connectRedis, getRedisStatus } from './services/redis';
import { connectMongoDB, getMongoStatus } from './db/mongoose';
import { checkPostgresConnection } from './db/prisma';

import rateLimit from 'express-rate-limit';

// Route Controllers
import { register, login, getMe } from './controllers/auth';
import { createInterview, getInterviews, getInterviewById, updateInterview, deleteInterview, generateQuestions } from './controllers/interview';
import { fetchChallenge } from './controllers/external';
import { verifyPayment } from './controllers/payment';
import { getEventLoopDiagnostic, getAsyncAwaitDiagnostic, getHoistingDiagnostic } from './controllers/diagnostics';
import { uploadResume, uploadMiddleware } from './controllers/upload';

// Sockets & Jobs
import { setupInterviewSockets } from './sockets/interview';
import { initCronJobs } from './jobs/cleanup';

// Middleware
import { authenticate } from './middleware/auth';
import { validate } from './middleware/validate';

// Validation Schemas
import { registerSchema, loginSchema, createInterviewSchema, updateInterviewSchema } from './utils/validation';
import { generateQuestionsInputSchema } from './utils/aiValidation';
import { validateEnv } from './config/env';

validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Hardening: Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit sensitive endpoints
});

import { createRequestLogger } from './middleware/requestLogger';

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Security Hardening: Body limit
app.use('/api', apiLimiter);

// Closure Demonstration: Apply the configured request logger
app.use(createRequestLogger('API'));

// Health Check API
app.get('/api/health', async (req, res) => {
  const postgresStatus = await checkPostgresConnection();
  const mongoStatus = getMongoStatus();
  const redisStatus = getRedisStatus();

  res.json({
    status: 'ok',
    service: 'interviewflow-api',
    dependencies: {
      postgres: postgresStatus,
      mongodb: mongoStatus,
      redis: redisStatus,
    }
  });
});

// Auth Routes
app.post('/api/auth/register', strictLimiter, validate(registerSchema), register);
app.post('/api/auth/login', strictLimiter, validate(loginSchema), login);
app.get('/api/auth/me', authenticate, getMe);

// User Profile Routes
app.post('/api/users/upload-resume', strictLimiter, authenticate, (req, res, next) => {
  uploadMiddleware.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadResume);

// Interview Routes
app.post('/api/interviews', authenticate, validate(createInterviewSchema), createInterview);
app.get('/api/interviews', authenticate, getInterviews);
app.get('/api/interviews/:id', authenticate, getInterviewById);
app.patch('/api/interviews/:id', authenticate, validate(updateInterviewSchema), updateInterview);
app.delete('/api/interviews/:id', authenticate, deleteInterview);
app.post('/api/interviews/:id/generate-questions', strictLimiter, authenticate, validate(generateQuestionsInputSchema), generateQuestions);

// External Routes
app.get('/api/external/challenge', fetchChallenge);

// Payment Routes
app.post('/api/payments/verify', strictLimiter, authenticate, verifyPayment);

// Diagnostic Routes
app.get('/api/diagnostics/event-loop', getEventLoopDiagnostic);
app.get('/api/diagnostics/async-await', getAsyncAwaitDiagnostic);
app.get('/api/diagnostics/hoisting', getHoistingDiagnostic);

// Error Handling Middleware
app.use(errorHandler);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  }
});

setupInterviewSockets(io);

// Initialize Services
const startServer = async () => {
  console.log('Starting API Server...');
  await connectMongoDB();
  await connectRedis();
  initCronJobs();

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
