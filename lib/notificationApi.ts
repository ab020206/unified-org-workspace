import { NotificationDto, NotificationListQueryDto, ApiResponse } from '@workspace/shared-types';

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

export const notificationApi = {
  getNotifications: async (
    query?: NotificationListQueryDto,
    activeOrgId?: string,
    token?: string
  ): Promise<{ items: NotificationDto[]; total: number; unreadCount: number }> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.unreadOnly) params.append('unreadOnly', 'true');
    if (query?.type) params.append('type', query.type);

    try {
      const res = await fetch(`${API_BASE}/notifications?${params.toString()}`, {
        headers: getHeaders(activeOrgId, token),
      });
      return await handleResponse<{ items: NotificationDto[]; total: number; unreadCount: number }>(
        res
      );
    } catch {
      return { items: [], total: 0, unreadCount: 0 };
    }
  },

  markAsRead: async (id: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  markAllAsRead: async (activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  deleteNotification: async (id: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },
};
