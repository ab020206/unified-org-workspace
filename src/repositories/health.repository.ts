import { prisma } from '../config/prisma';
import { RedisManager } from '../config/redis';

export interface ComponentHealth {
  connected: boolean;
  latencyMs?: number;
}

export class HealthRepository {
  public async checkDatabase(): Promise<ComponentHealth> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { connected: true, latencyMs: Date.now() - start };
    } catch {
      return { connected: false };
    }
  }

  public async checkRedis(): Promise<ComponentHealth> {
    return RedisManager.ping();
  }
}
