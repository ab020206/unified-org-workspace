import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  base: {
    env: env.NODE_ENV,
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});
