import { DigestDto, ApiResponse } from '@workspace/shared-types';

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
    message: `Network response was not valid JSON (HTTP ${res.status})`,
  }));

  if (!res.ok || !json.success) {
    throw new Error(json.message || `API request failed (HTTP ${res.status})`);
  }

  return json.data;
}

export const digestApi = {
  getLatestDigest: async (activeOrgId?: string, token?: string): Promise<DigestDto> => {
    const res = await fetch(`${API_BASE}/digest`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<DigestDto>(res);
  },

  triggerGenerate: async (activeOrgId?: string, token?: string): Promise<DigestDto> => {
    const res = await fetch(`${API_BASE}/digest/generate`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<DigestDto>(res);
  },

  getHistory: async (
    page = 1,
    limit = 10,
    activeOrgId?: string,
    token?: string
  ): Promise<{ items: DigestDto[]; total: number }> => {
    const res = await fetch(`${API_BASE}/digest/history?page=${page}&limit=${limit}`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<{ items: DigestDto[]; total: number }>(res);
  },
};
