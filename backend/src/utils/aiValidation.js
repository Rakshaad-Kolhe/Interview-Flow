"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestionsInputSchema = exports.generateQuestionsOutputSchema = void 0;
const zod_1 = require("zod");
exports.generateQuestionsOutputSchema = zod_1.z.object({
    questions: zod_1.z.array(zod_1.z.object({
        question: zod_1.z.string(),
        category: zod_1.z.string(),
        difficulty: zod_1.z.string(),
    })),
});
exports.generateQuestionsInputSchema = zod_1.z.object({
    role: zod_1.z.string().min(1).max(100),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']),
    count: zod_1.z.number().int().min(1, 'Minimum 1 question').max(10, 'Maximum 10 questions'),
});
//# sourceMappingURL=aiValidation.js.map