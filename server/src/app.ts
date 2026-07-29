import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import asyncHandler from 'express-async-handler';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLoggerMiddleware } from './middleware/logging';
import { globalErrorHandler } from './middleware/errorHandler';
import { sanitizeInputMiddleware } from './middleware/sanitize.middleware';
import v1Routes from './routes/v1.routes';
import { ApiError } from './utils/apiError';
import { HealthController } from './controllers/health.controller';

const app = express();
const healthController = new HealthController();

// Security & Core Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    xFrameOptions: { action: 'deny' },
    xContentTypeOptions: true,
  })
);

app.use(
  cors({
    origin: [env.CLIENT_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id', 'X-Request-Id'],
  })
);

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input Sanitization
app.use(sanitizeInputMiddleware);

// Serve static file uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request Context & Logging
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Root Health Monitoring Aliases
app.get('/health', asyncHandler(healthController.getHealth));
app.get('/live', asyncHandler(healthController.getLiveness));
app.get('/ready', asyncHandler(healthController.getReadiness));

// API Routes Version 1
app.use('/api/v1', v1Routes);

// Root Fallback Endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Unified Organization Workspace API Engine',
    version: '1.0.0',
    status: 'production-ready',
    docs: '/api/v1/health',
  });
});

// 404 Route Handler
app.use('*', (_req, _res, next) => {
  next(ApiError.notFound('Requested API route does not exist'));
});

// Global Error Handler
app.use(globalErrorHandler);

export { app };
