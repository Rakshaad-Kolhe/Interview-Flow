import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCache, setCache, deleteCache } from '../src/services/cache';
import redisClient from '../src/services/redis';

vi.mock('../src/services/redis', () => {
  const getMock = vi.fn();
  const setMock = vi.fn();
  const delMock = vi.fn();
  return {
    default: {
      isOpen: true,
      get: getMock,
      set: setMock,
      del: delMock,
    },
    getRedisStatus: vi.fn()
  };
});

describe('Redis Cache Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return parsed data on cache hit', async () => {
    (redisClient.get as any).mockResolvedValue(JSON.stringify([{ id: '1', title: 'Test' }]));
    const result = await getCache('test_key');
    expect(result).toEqual([{ id: '1', title: 'Test' }]);
    expect(redisClient.get).toHaveBeenCalledWith('test_key');
  });

  it('should return null on cache miss', async () => {
    (redisClient.get as any).mockResolvedValue(null);
    const result = await getCache('test_key');
    expect(result).toBeNull();
  });

  it('should gracefully degrade on redis failure', async () => {
    (redisClient.get as any).mockRejectedValue(new Error('Redis connection lost'));
    const result = await getCache('test_key');
    expect(result).toBeNull(); // Application should not crash, it should just act like a miss
  });

  it('should invalidate cache key on delete', async () => {
    await deleteCache('test_key');
    expect(redisClient.del).toHaveBeenCalledWith('test_key');
  });
});
