declare const redisClient: import("redis").RedisClientType<{}, {}, {}, 3, {}>;
export declare const connectRedis: () => Promise<void>;
export declare const setCache: (key: string, value: string) => Promise<void>;
export declare const getCache: (key: string) => Promise<string | null>;
export declare const deleteCache: (key: string) => Promise<void>;
export declare const getRedisStatus: () => "connected" | "disconnected";
export default redisClient;
//# sourceMappingURL=redis.d.ts.map