import { HealthRepository } from '../repositories/health.repository';
import { HealthCheckResponse } from '@workspace/shared-types';
import { env } from '../config/env';

export class HealthService {
  constructor(private readonly healthRepository: HealthRepository = new HealthRepository()) {}

  public async getHealthStatus(): Promise<
    HealthCheckResponse & { memory: NodeJS.MemoryUsage; queue: { status: string } }
  > {
    const dbHealth = await this.healthRepository.checkDatabase();
    const redisHealth = await this.healthRepository.checkRedis();

    const isFullyHealthy = dbHealth.connected && redisHealth.connected;
    const isDegraded = !isFullyHealthy && (dbHealth.connected || redisHealth.connected);

    let status: 'ok' | 'degraded' | 'error' = 'ok';
    if (!isFullyHealthy) {
      status = isDegraded ? 'degraded' : 'error';
    }

    return {
      status,
      services: {
        database: {
          status: dbHealth.connected ? 'connected' : 'disconnected',
          latencyMs: dbHealth.latencyMs,
        },
        redis: {
          status: redisHealth.connected ? 'connected' : 'disconnected',
          latencyMs: redisHealth.latencyMs,
        },
      },
      queue: {
        status: redisHealth.connected ? 'active' : 'degraded',
      },
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }

  public async checkLiveness(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  public async checkReadiness(): Promise<{ ready: boolean; database: boolean; redis: boolean }> {
    const dbHealth = await this.healthRepository.checkDatabase();
    const redisHealth = await this.healthRepository.checkRedis();

    return {
      ready: dbHealth.connected && redisHealth.connected,
      database: dbHealth.connected,
      redis: redisHealth.connected,
    };
  }
}
