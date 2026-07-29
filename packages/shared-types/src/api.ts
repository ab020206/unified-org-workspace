export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  requestId: string;
  timestamp: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedApiResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  requestId: string;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  services: {
    database: {
      status: 'connected' | 'disconnected';
      latencyMs?: number;
    };
    redis: {
      status: 'connected' | 'disconnected';
      latencyMs?: number;
    };
  };
  uptime: number;
  environment: string;
  timestamp: string;
}
