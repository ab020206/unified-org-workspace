import {
  AuditLogDto,
  PaginatedAuditResponse,
  AuditDashboardStatsDto,
  AuditListQueryDto,
  ApiResponse,
} from '@workspace/shared-types';

const API_BASE = 'http://localhost:4000/api/v1';

const getHeaders = (activeOrgId?: string, token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authToken =
    token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const orgId =
    activeOrgId || (typeof window !== 'undefined' ? localStorage.getItem('activeOrgId') : null);
  if (orgId) {
    headers['X-Organization-Id'] = orgId;
  }

  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: 'Network response was not valid JSON',
  }));

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }

  return json.data;
}

export const auditApi = {
  getLogs: async (
    query?: AuditListQueryDto,
    activeOrgId?: string,
    token?: string
  ): Promise<PaginatedAuditResponse> => {
    const params = new URLSearchParams();
    if (query) {
      if (query.page) params.set('page', query.page.toString());
      if (query.limit) params.set('limit', query.limit.toString());
      if (query.search) params.set('search', query.search);
      if (query.module) params.set('module', query.module);
      if (query.action) params.set('action', query.action);
      if (query.actorId) params.set('actorId', query.actorId);
      if (query.entityType) params.set('entityType', query.entityType);
      if (query.entityId) params.set('entityId', query.entityId);
      if (query.organizationId) params.set('organizationId', query.organizationId);
      if (query.startDate) params.set('startDate', query.startDate);
      if (query.endDate) params.set('endDate', query.endDate);
      if (query.sortBy) params.set('sortBy', query.sortBy);
      if (query.sortOrder) params.set('sortOrder', query.sortOrder);
    }

    const res = await fetch(`${API_BASE}/audit?${params.toString()}`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PaginatedAuditResponse>(res);
  },

  getStats: async (activeOrgId?: string, token?: string): Promise<AuditDashboardStatsDto> => {
    const res = await fetch(`${API_BASE}/audit/stats`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<AuditDashboardStatsDto>(res);
  },

  getModules: async (activeOrgId?: string, token?: string): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/audit/modules`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<string[]>(res);
  },

  getActions: async (activeOrgId?: string, token?: string): Promise<string[]> => {
    const res = await fetch(`${API_BASE}/audit/actions`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<string[]>(res);
  },

  getLogById: async (id: string, activeOrgId?: string, token?: string): Promise<AuditLogDto> => {
    const res = await fetch(`${API_BASE}/audit/${id}`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<AuditLogDto>(res);
  },
};
