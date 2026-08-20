"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCache = exports.setCache = exports.getCache = void 0;
const redis_1 = __importDefault(require("./redis"));
const DEFAULT_TTL = 60; // 60 seconds
const getCache = async (key) => {
    try {
        if (!redis_1.default.isOpen)
            return null;
        const data = await redis_1.default.get(key);
        return data ? JSON.parse(data) : null;
    }
    catch (error) {
        console.error(`Redis Get Error for key ${key}:`, error);
        return null; // Graceful fallback
    }
};
exports.getCache = getCache;
const setCache = async (key, value, ttl = DEFAULT_TTL) => {
    try {
        if (!redis_1.default.isOpen)
            return;
        await redis_1.default.set(key, JSON.stringify(value), { EX: ttl });
    }
    catch (error) {
        console.error(`Redis Set Error for key ${key}:`, error);
    }
};
exports.setCache = setCache;
const deleteCache = async (key) => {
    try {
        if (!redis_1.default.isOpen)
            return;
        await redis_1.default.del(key);
        console.log(`[Redis] Cache invalidated for key: ${key}`);
    }
    catch (error) {
        console.error(`Redis Delete Error for key ${key}:`, error);
    }
};
exports.deleteCache = deleteCache;
//# sourceMappingURL=cache.js.map