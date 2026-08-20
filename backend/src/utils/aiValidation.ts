import { z } from 'zod';

export const generateQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      category: z.string(),
      difficulty: z.string(),
    })
  ),
});

export const generateQuestionsInputSchema = z.object({
  role: z.string().min(1).max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().int().min(1, 'Minimum 1 question').max(10, 'Maximum 10 questions'),
});
