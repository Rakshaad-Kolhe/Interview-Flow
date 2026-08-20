"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInterviewSchema = exports.createInterviewSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100),
    email: zod_1.z.string().email('Invalid email address').transform((e) => e.toLowerCase()),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address').transform((e) => e.toLowerCase()),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.createInterviewSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(100),
    type: zod_1.z.string().min(1, 'Type is required').max(50),
});
exports.updateInterviewSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(100).optional(),
    status: zod_1.z.string().min(1, 'Status is required').max(50).optional(),
});
//# sourceMappingURL=validation.js.map