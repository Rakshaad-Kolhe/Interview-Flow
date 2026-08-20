"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const errorHandler_1 = require("./middleware/errorHandler");
const redis_1 = require("./services/redis");
const mongoose_1 = require("./db/mongoose");
const prisma_1 = require("./db/prisma");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Route Controllers
const auth_1 = require("./controllers/auth");
const interview_1 = require("./controllers/interview");
const external_1 = require("./controllers/external");
const payment_1 = require("./controllers/payment");
// Sockets & Jobs
const interview_2 = require("./sockets/interview");
const cleanup_1 = require("./jobs/cleanup");
// Middleware
const auth_2 = require("./middleware/auth");
const validate_1 = require("./middleware/validate");
// Validation Schemas
const validation_1 = require("./utils/validation");
const aiValidation_1 = require("./utils/aiValidation");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Hardening: Rate Limiting
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
});
const strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit sensitive endpoints
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10kb' })); // Security Hardening: Body limit
app.use('/api', apiLimiter);
// Health Check API
app.get('/api/health', async (req, res) => {
    const postgresStatus = await (0, prisma_1.checkPostgresConnection)();
    const mongoStatus = (0, mongoose_1.getMongoStatus)();
    const redisStatus = (0, redis_1.getRedisStatus)();
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
app.post('/api/auth/register', strictLimiter, (0, validate_1.validate)(validation_1.registerSchema), auth_1.register);
app.post('/api/auth/login', strictLimiter, (0, validate_1.validate)(validation_1.loginSchema), auth_1.login);
app.get('/api/auth/me', auth_2.authenticate, auth_1.getMe);
// Interview Routes
app.post('/api/interviews', auth_2.authenticate, (0, validate_1.validate)(validation_1.createInterviewSchema), interview_1.createInterview);
app.get('/api/interviews', auth_2.authenticate, interview_1.getInterviews);
app.get('/api/interviews/:id', auth_2.authenticate, interview_1.getInterviewById);
app.patch('/api/interviews/:id', auth_2.authenticate, (0, validate_1.validate)(validation_1.updateInterviewSchema), interview_1.updateInterview);
app.delete('/api/interviews/:id', auth_2.authenticate, interview_1.deleteInterview);
app.post('/api/interviews/:id/generate-questions', strictLimiter, auth_2.authenticate, (0, validate_1.validate)(aiValidation_1.generateQuestionsInputSchema), interview_1.generateQuestions);
// External Routes
app.get('/api/external/challenge', external_1.fetchChallenge);
// Payment Routes
app.post('/api/payments/verify', strictLimiter, auth_2.authenticate, payment_1.verifyPayment);
// Error Handling Middleware
app.use(errorHandler_1.errorHandler);
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    }
});
(0, interview_2.setupInterviewSockets)(io);
// Initialize Services
const startServer = async () => {
    console.log('Starting API Server...');
    await (0, mongoose_1.connectMongoDB)();
    await (0, redis_1.connectRedis)();
    (0, cleanup_1.initCronJobs)();
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};
startServer();
//# sourceMappingURL=server.js.map