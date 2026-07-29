import {
  OrganizationConnectionDto,
  SharedResourceDto,
  SharedResourcesFeedDto,
  CreateConnectionRequestDto,
  CreateShareDto,
  UpdateShareDto,
  ApiResponse,
} from '@workspace/shared-types';

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
    message: 'Network response was not valid JSON',
  }));

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }

  return json.data;
}

export const collaborationApi = {
  requestConnection: async (
    data: CreateConnectionRequestDto,
    activeOrgId?: string,
    token?: string
  ): Promise<OrganizationConnectionDto> => {
    const res = await fetch(`${API_BASE}/connections/request`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify(data),
    });
    return handleResponse<OrganizationConnectionDto>(res);
  },

  getConnections: async (
    activeOrgId?: string,
    token?: string
  ): Promise<OrganizationConnectionDto[]> => {
    const res = await fetch(`${API_BASE}/connections`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<OrganizationConnectionDto[]>(res);
  },

  acceptConnection: async (
    id: string,
    activeOrgId?: string,
    token?: string
  ): Promise<OrganizationConnectionDto> => {
    const res = await fetch(`${API_BASE}/connections/${id}/accept`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<OrganizationConnectionDto>(res);
  },

  rejectConnection: async (
    id: string,
    activeOrgId?: string,
    token?: string
  ): Promise<OrganizationConnectionDto> => {
    const res = await fetch(`${API_BASE}/connections/${id}/reject`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<OrganizationConnectionDto>(res);
  },

  disconnect: async (id: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/connections/${id}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  createShare: async (
    data: CreateShareDto,
    activeOrgId?: string,
    token?: string
  ): Promise<SharedResourceDto> => {
    const res = await fetch(`${API_BASE}/sharing`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify(data),
    });
    return handleResponse<SharedResourceDto>(res);
  },

  getDashboard: async (activeOrgId?: string, token?: string): Promise<SharedResourcesFeedDto> => {
    const res = await fetch(`${API_BASE}/sharing`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<SharedResourcesFeedDto>(res);
  },

  updateShare: async (
    id: string,
    data: UpdateShareDto,
    activeOrgId?: string,
    token?: string
  ): Promise<SharedResourceDto> => {
    const res = await fetch(`${API_BASE}/sharing/${id}`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify(data),
    });
    return handleResponse<SharedResourceDto>(res);
  },

  revokeShare: async (id: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/sharing/${id}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },
};
