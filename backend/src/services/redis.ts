import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
};

export const setCache = async (key: string, value: string) => {
  await redisClient.set(key, value);
};

export const getCache = async (key: string) => {
  return await redisClient.get(key);
};

export const deleteCache = async (key: string) => {
  await redisClient.del(key);
};

export const getRedisStatus = () => {
  return redisClient.isOpen ? 'connected' : 'disconnected';
};

export default redisClient;
