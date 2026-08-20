import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import redisClient from '../services/redis';
import prisma from '../db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const setupInterviewSockets = (io: Server) => {
  // Middleware for Authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token missing'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id} (User: ${socket.data.userId})`);

    socket.on('start_session', async (payload: { interviewId: string }) => {
      try {
        const { interviewId } = payload;
        const userId = socket.data.userId;

        // Verify Ownership
        const interview = await prisma.interview.findFirst({
          where: { id: interviewId, userId },
        });

        if (!interview) {
          socket.emit('error', { message: 'Interview not found or unauthorized' });
          return;
        }

        // Store temporary session state in Redis (TTL: 30 mins)
        const sessionKey = `interview:session:${interviewId}`;
        const sessionState = {
          currentQuestion: 1,
          totalQuestions: 5,
          status: 'in_progress',
          startedAt: Date.now(),
        };

        if (redisClient.isOpen) {
          await redisClient.set(sessionKey, JSON.stringify(sessionState), { EX: 1800 });
        }

        socket.join(interviewId);
        
        // Broadcast events
        socket.emit('interview:started', { interviewId });
        setTimeout(() => {
          socket.emit('question:shown', { 
            questionNumber: 1, 
            text: 'Explain the difference between Redis and PostgreSQL.' 
          });
        }, 1000); // Simulate slight delay for realism

      } catch (error) {
        console.error('Socket start_session error:', error);
      }
    });

    socket.on('submit_answer', async (payload: { interviewId: string, answer: string }) => {
      try {
        const { interviewId } = payload;
        const sessionKey = `interview:session:${interviewId}`;

        let sessionState = { currentQuestion: 1, totalQuestions: 5 };
        
        if (redisClient.isOpen) {
          const rawSession = await redisClient.get(sessionKey);
          if (rawSession) sessionState = JSON.parse(rawSession);
        }

        sessionState.currentQuestion += 1;

        if (sessionState.currentQuestion > sessionState.totalQuestions) {
          socket.emit('interview:completed', { message: 'Interview finished!' });
          if (redisClient.isOpen) await redisClient.del(sessionKey);
        } else {
          if (redisClient.isOpen) {
            await redisClient.set(sessionKey, JSON.stringify(sessionState), { EX: 1800 });
          }
          socket.emit('interview:progress', {
            currentQuestion: sessionState.currentQuestion,
            totalQuestions: sessionState.totalQuestions,
          });
          
          socket.emit('question:shown', { 
            questionNumber: sessionState.currentQuestion, 
            text: `Follow up question ${sessionState.currentQuestion}...` 
          });
        }
      } catch (error) {
        console.error('Socket submit_answer error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });
};
