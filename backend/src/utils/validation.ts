import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').transform((e) => e.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').transform((e) => e.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export const createInterviewSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  type: z.string().min(1, 'Type is required').max(50),
});

export const updateInterviewSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  status: z.string().min(1, 'Status is required').max(50).optional(),
});
