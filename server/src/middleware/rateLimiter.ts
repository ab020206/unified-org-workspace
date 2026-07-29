import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';

// Pause rate limits for manual testing / demo mode
const skipLimit = true;

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: skipLimit ? 10000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        'Too many authentication attempts from this IP, please try again after 15 minutes',
        'RATE_LIMIT_EXCEEDED'
      )
    );
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: skipLimit ? 10000 : 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        'AI generation rate limit reached. Please wait before generating new digests.',
        'RATE_LIMIT_EXCEEDED'
      )
    );
  },
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: skipLimit ? 10000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        'File upload rate limit reached. Please wait before uploading more files.',
        'RATE_LIMIT_EXCEEDED'
      )
    );
  },
});

export const inviteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: skipLimit ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(
      new ApiError(
        429,
        'Invitation rate limit reached. Please wait before inviting more members.',
        'RATE_LIMIT_EXCEEDED'
      )
    );
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: skipLimit ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new ApiError(429, 'General request rate limit exceeded.', 'RATE_LIMIT_EXCEEDED'));
  },
});
