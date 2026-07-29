export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    code = 'INTERNAL_SERVER_ERROR',
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  public static unauthorized(message = 'Unauthorized access'): ApiError {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  public static forbidden(message = 'Forbidden action'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  public static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  public static conflict(message: string): ApiError {
    return new ApiError(409, message, 'CONFLICT');
  }

  public static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, 'INTERNAL_SERVER_ERROR');
  }
}
