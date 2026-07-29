import { RequestHandler } from 'express';
import { AppRequest } from '../types/index';
import { logger } from '../utils/logger';

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const appReq = req as AppRequest;
  res.on('finish', () => {
    const duration = Date.now() - (appReq.startTime || Date.now());
    logger.info(
      {
        requestId: appReq.requestId || 'N/A',
        method: req.method,
        route: req.originalUrl || req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        durationMs: duration,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
      'HTTP Request Completed'
    );
  });

  next();
};
