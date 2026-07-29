import { ApiResponse, ApiErrorResponse } from '@workspace/shared-types';

export function createSuccessResponse<T>(
  data: T,
  message = 'Operation successful',
  requestId = 'N/A'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    requestId,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  message: string,
  code = 'INTERNAL_SERVER_ERROR',
  requestId = 'N/A',
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    message,
    code,
    requestId,
    timestamp: new Date().toISOString(),
    details,
  };
}
