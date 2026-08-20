import redisClient from './redis';

const DEFAULT_TTL = 60; // 60 seconds

export const getCache = async (key: string): Promise<any | null> => {
  try {
    if (!redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis Get Error for key ${key}:`, error);
    return null; // Graceful fallback
  }
};

export const setCache = async (key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(key, JSON.stringify(value), { EX: ttl });
  } catch (error) {
    console.error(`Redis Set Error for key ${key}:`, error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
    console.log(`[Redis] Cache invalidated for key: ${key}`);
  } catch (error) {
    console.error(`Redis Delete Error for key ${key}:`, error);
  }
};
