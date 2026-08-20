"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestions = exports.deleteInterview = exports.updateInterview = exports.getInterviewById = exports.getInterviews = exports.createInterview = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const cache_1 = require("../services/cache");
const createInterview = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { title, type } = req.body;
        const result = await prisma_1.default.$transaction(async (tx) => {
            const interview = await tx.interview.create({
                data: { userId, title, type, status: 'created' },
            });
            const log = await tx.interviewLog.create({
                data: { interviewId: interview.id, action: 'CREATED_INTERVIEW' },
            });
            return { interview, log };
        });
        // Cache Invalidation
        await (0, cache_1.deleteCache)(`interviews:user:${userId}`);
        res.status(201).json({ success: true, data: result.interview });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create interview' });
    }
};
exports.createInterview = createInterview;
const getInterviews = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const cacheKey = `interviews:user:${userId}`;
        const cachedData = await (0, cache_1.getCache)(cacheKey);
        if (cachedData) {
            console.log(`[Cache Hit] interviews for user ${userId}`);
            return res.json({ success: true, data: cachedData, source: 'cache' });
        }
        console.log(`[Cache Miss] interviews for user ${userId}`);
        const interviews = await prisma_1.default.interview.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        await (0, cache_1.setCache)(cacheKey, interviews, 60); // 60s TTL
        res.json({ success: true, data: interviews, source: 'database' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get interviews' });
    }
};
exports.getInterviews = getInterviews;
const getInterviewById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const interview = await prisma_1.default.interview.findFirst({
            where: { id, userId }
        });
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }
        res.json({ success: true, data: interview });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getInterviewById = getInterviewById;
const updateInterview = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { title, status } = req.body;
        const existing = await prisma_1.default.interview.findFirst({ where: { id, userId } });
        if (!existing)
            return res.status(404).json({ success: false, message: 'Interview not found' });
        const updated = await prisma_1.default.interview.update({
            where: { id },
            data: { title, status }
        });
        await (0, cache_1.deleteCache)(`interviews:user:${userId}`);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateInterview = updateInterview;
const deleteInterview = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const existing = await prisma_1.default.interview.findFirst({ where: { id, userId } });
        if (!existing)
            return res.status(404).json({ success: false, message: 'Interview not found' });
        await prisma_1.default.interview.delete({ where: { id } });
        await (0, cache_1.deleteCache)(`interviews:user:${userId}`);
        res.json({ success: true, message: 'Interview deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteInterview = deleteInterview;
const ai_1 = require("../services/ai");
const generateQuestions = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { role, difficulty, count } = req.body;
        // Verify ownership
        const interview = await prisma_1.default.interview.findFirst({
            where: { id, userId }
        });
        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }
        const aiResponse = await (0, ai_1.generateInterviewQuestions)(role, difficulty, count);
        res.json({ success: true, data: aiResponse });
    }
    catch (error) {
        console.error('Generate questions error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Unable to generate interview questions' });
    }
};
exports.generateQuestions = generateQuestions;
//# sourceMappingURL=interview.js.map