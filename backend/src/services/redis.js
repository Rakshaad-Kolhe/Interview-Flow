"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisStatus = exports.deleteCache = exports.getCache = exports.setCache = exports.connectRedis = void 0;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};
exports.connectRedis = connectRedis;
const setCache = async (key, value) => {
    await redisClient.set(key, value);
};
exports.setCache = setCache;
const getCache = async (key) => {
    return await redisClient.get(key);
};
exports.getCache = getCache;
const deleteCache = async (key) => {
    await redisClient.del(key);
};
exports.deleteCache = deleteCache;
const getRedisStatus = () => {
    return redisClient.isOpen ? 'connected' : 'disconnected';
};
exports.getRedisStatus = getRedisStatus;
exports.default = redisClient;
//# sourceMappingURL=redis.js.map