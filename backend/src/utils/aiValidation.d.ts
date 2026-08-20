import { z } from 'zod';
export declare const generateQuestionsOutputSchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        category: z.ZodString;
        difficulty: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const generateQuestionsInputSchema: z.ZodObject<{
    role: z.ZodString;
    difficulty: z.ZodEnum<{
        easy: "easy";
        hard: "hard";
        medium: "medium";
    }>;
    count: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=aiValidation.d.ts.map