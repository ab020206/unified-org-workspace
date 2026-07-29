import { logger } from '../utils/logger';
import { processDigestJob } from './digest.worker';
import { digestQueue } from '../queues/digest.queue';

logger.info('Starting Unified Background Worker Service...');

digestQueue.setProcessor(async (jobData) => {
  logger.info({ jobData }, 'Worker picked up job');
  await processDigestJob(jobData);
});

logger.info('Background Worker Service registered and running.');

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down worker...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down worker...');
  process.exit(0);
});
