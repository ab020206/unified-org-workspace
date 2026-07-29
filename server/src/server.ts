import { app } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { RedisManager } from './config/redis';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Unified Workspace Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`🔗 Base API Endpoint: http://localhost:${env.PORT}/api/v1`);
});

// Graceful Shutdown Handler
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await prisma.$disconnect();
      logger.info('Prisma database connection closed.');

      await RedisManager.disconnect();
      logger.info('Redis connection closed.');

      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  });

  // Force shutdown after 10s if hanging
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
