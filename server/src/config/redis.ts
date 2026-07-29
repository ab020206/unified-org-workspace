import Redis from 'ioredis';
import { env } from './env';

class RedisManager {
  private static instance: Redis | null = null;

  public static getInstance(): Redis {
    if (!RedisManager.instance) {
      RedisManager.instance = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
        lazyConnect: true,
      });

      RedisManager.instance.on('error', (err) => {
        console.warn('⚠️ Redis Client Error:', err.message);
      });

      RedisManager.instance.on('connect', () => {
        console.info('🔌 Redis Client Connected');
      });
    }

    return RedisManager.instance;
  }

  public static async ping(): Promise<{ connected: boolean; latencyMs?: number }> {
    const client = RedisManager.getInstance();
    const start = Date.now();
    try {
      if (client.status === 'wait') {
        await client.connect();
      }
      const res = await client.ping();
      const latencyMs = Date.now() - start;
      return { connected: res === 'PONG', latencyMs };
    } catch {
      return { connected: false };
    }
  }

  public static async disconnect(): Promise<void> {
    if (RedisManager.instance) {
      await RedisManager.instance.quit();
      RedisManager.instance = null;
    }
  }
}

export const redis = RedisManager.getInstance();
export { RedisManager };
