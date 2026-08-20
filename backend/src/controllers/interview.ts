import { Response } from 'express';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

import { getCache, setCache, deleteCache } from '../services/cache';

export const createInterview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { title, type } = req.body;

    // Transactions
    const [interview] = await prisma.$transaction([
      prisma.interview.create({
        data: { userId, title, type, status: 'created' },
      })
    ]);
    const log = await prisma.interviewLog.create({
      data: { interviewId: interview.id, action: 'CREATED_INTERVIEW' },
    });
    const result = { interview, log };

    // Cache Invalidation
    await deleteCache(`interviews:user:${userId}`);

    res.status(201).json({ success: true, data: result.interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create interview' });
  }
};

export const getInterviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const cacheKey = `interviews:user:${userId}`;
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      console.log(`[Cache Hit] interviews for user ${userId}`);
      return res.json({ success: true, data: cachedData, source: 'cache' });
    }
    
    console.log(`[Cache Miss] interviews for user ${userId}`);
    const interviews = await prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    await setCache(cacheKey, interviews, 60); // 60s TTL

    res.json({ success: true, data: interviews, source: 'database' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get interviews' });
  }
};

export const getInterviewById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const interview = await prisma.interview.findFirst({
      where: { id, userId }
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInterview = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { title, status } = req.body;

    const existing = await prisma.interview.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Interview not found' });

    const updated = await prisma.interview.update({
      where: { id },
      data: { title, status }
    });

    await deleteCache(`interviews:user:${userId}`);

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInterview = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const existing = await prisma.interview.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Interview not found' });

    await prisma.interview.delete({ where: { id } });

    await deleteCache(`interviews:user:${userId}`);

    res.json({ success: true, message: 'Interview deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { generateInterviewQuestions } from '../services/ai';

export const generateQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { role, difficulty, count } = req.body;

    // Verify ownership
    const interview = await prisma.interview.findFirst({
      where: { id, userId }
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const aiResponse = await generateInterviewQuestions(role, difficulty, count);

    res.json({ success: true, data: aiResponse });
  } catch (error: any) {
    console.error('Generate questions error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Unable to generate interview questions' });
  }
};
