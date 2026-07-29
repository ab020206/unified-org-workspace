import { ApiResponse, SecuritySessionPayload, FeatureFlagPayload } from '@workspace/shared-types';

export interface HealthCheckPayload {
  status: string;
  services: {
    database: { status: string; latencyMs: number };
    redis: { status: string; latencyMs: number };
  };
  queue?: { status: string };
  uptime: number;
  environment: string;
}

import { API_BASE_URL } from './api';

const API_BASE = API_BASE_URL;

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
    message: 'An unexpected response error occurred',
  }));

  if (!res.ok || !json.success) {
    throw new Error(json.message || `API request failed with status ${res.status}`);
  }

  return json.data!;
}

export const securityApi = {
  getHealth: async (): Promise<HealthCheckPayload> => {
    const rootBase = API_BASE.replace(/\/v1$/, '');
    const res = await fetch(`${rootBase}/health`, {
      headers: getHeaders(),
    });
    return handleResponse<HealthCheckPayload>(res);
  },

  getActiveSessions: async (activeOrgId?: string): Promise<SecuritySessionPayload[]> => {
    const res = await fetch(`${API_BASE}/security/sessions`, {
      headers: getHeaders(activeOrgId),
    });
    return handleResponse<SecuritySessionPayload[]>(res);
  },

  revokeSession: async (sessionId: string, activeOrgId?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/security/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId),
    });
    return handleResponse<void>(res);
  },

  logoutAll: async (activeOrgId?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/security/sessions/logout-all`, {
      method: 'POST',
      headers: getHeaders(activeOrgId),
    });
    return handleResponse<void>(res);
  },

  getFeatureFlags: async (
    activeOrgId?: string
  ): Promise<{ flags: Record<string, boolean>; details: FeatureFlagPayload[] }> => {
    const res = await fetch(`${API_BASE}/feature-flags`, {
      headers: getHeaders(activeOrgId),
    });
    return handleResponse<{ flags: Record<string, boolean>; details: FeatureFlagPayload[] }>(res);
  },

  toggleFeatureFlag: async (
    key: string,
    enabled: boolean,
    activeOrgId?: string
  ): Promise<FeatureFlagPayload> => {
    const res = await fetch(`${API_BASE}/feature-flags/${key}`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId),
      body: JSON.stringify({ enabled }),
    });
    return handleResponse<FeatureFlagPayload>(res);
  },
};
