import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/src/utils/response';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: unknown) {
    super(message, statusCode, code, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class TenantIsolationError extends AppError {
  constructor(message = 'Cross-tenant operation violation', details?: unknown) {
    super(message, 403, 'TENANT_ISOLATION_VIOLATION', details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details?: unknown) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

export class AiError extends AppError {
  constructor(message = 'AI service execution failed', details?: unknown) {
    super(message, 502, 'AI_SERVICE_ERROR', details);
  }
}

export function handleApiError(error: unknown, requestId = 'N/A'): NextResponse {
  console.error('[API Error]:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      createErrorResponse(error.message, error.code, requestId, error.details),
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      createErrorResponse(error.message, 'INTERNAL_SERVER_ERROR', requestId),
      { status: 500 }
    );
  }

  return NextResponse.json(
    createErrorResponse('An unexpected error occurred', 'INTERNAL_SERVER_ERROR', requestId),
    { status: 500 }
  );
}
