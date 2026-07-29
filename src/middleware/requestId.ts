import { RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { AppRequest } from '../types/index';
import { DEFAULT_HEADER_REQUEST_ID } from '../constants/index';

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const appReq = req as AppRequest;
  const incomingId = req.headers[DEFAULT_HEADER_REQUEST_ID] as string | undefined;
  const id = incomingId || randomUUID();

  appReq.requestId = id;
  appReq.startTime = Date.now();

  res.setHeader(DEFAULT_HEADER_REQUEST_ID, id);
  next();
};
