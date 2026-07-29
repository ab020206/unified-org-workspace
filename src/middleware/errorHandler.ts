import { ErrorRequestHandler } from 'express';
import { AppRequest } from '../types/index';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { createErrorResponse } from '@workspace/shared-utils';

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next
) => {
  const appReq = req as AppRequest;
  const requestId = appReq.requestId || 'N/A';
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err?.name === 'UnauthorizedError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = 'Invalid token';
  } else {
    logger.error(
      {
        err,
        requestId,
        route: req.originalUrl,
        method: req.method,
      },
      'Unhandled Server Exception'
    );
  }

  const responseBody = createErrorResponse(message, code, requestId, details);
  res.status(statusCode).json(responseBody);
};
