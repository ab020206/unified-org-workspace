import {
  TicketDto,
  PaginatedTicketResponse,
  TicketDashboardStatsDto,
  CreateTicketDto,
  UpdateTicketDto,
  TicketStatus,
  TicketCommentDto,
  TicketAttachmentDto,
  TicketActivityDto,
  ApiResponse,
  TicketListQueryDto,
} from '@workspace/shared-types';

const API_BASE = 'http://localhost:4000/api/v1';

const getHeaders = (activeOrgId?: string, token?: string, isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

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

export const ticketApi = {
  getTickets: async (
    query?: TicketListQueryDto,
    activeOrgId?: string,
    token?: string
  ): Promise<PaginatedTicketResponse> => {
    const params = new URLSearchParams();
    if (query) {
      if (query.page) params.set('page', query.page.toString());
      if (query.limit) params.set('limit', query.limit.toString());
      if (query.search) params.set('search', query.search);
      if (query.assignedTo) params.set('assignedTo', query.assignedTo);
      if (query.createdBy) params.set('createdBy', query.createdBy);
      if (query.startDate) params.set('startDate', query.startDate);
      if (query.endDate) params.set('endDate', query.endDate);
      if (query.sortBy) params.set('sortBy', query.sortBy);
      if (query.sortOrder) params.set('sortOrder', query.sortOrder);

      if (query.status) {
        const statuses = Array.isArray(query.status) ? query.status : [query.status];
        statuses.forEach((s) => params.append('status', s));
      }
      if (query.priority) {
        const priorities = Array.isArray(query.priority) ? query.priority : [query.priority];
        priorities.forEach((p) => params.append('priority', p));
      }
      if (query.category) {
        const categories = Array.isArray(query.category) ? query.category : [query.category];
        categories.forEach((c) => params.append('category', c));
      }
    }

    const res = await fetch(`${API_BASE}/tickets?${params.toString()}`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PaginatedTicketResponse>(res);
  },

  getStats: async (activeOrgId?: string, token?: string): Promise<TicketDashboardStatsDto> => {
    const res = await fetch(`${API_BASE}/tickets/stats`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<TicketDashboardStatsDto>(res);
  },

  getTicketById: async (id: string, activeOrgId?: string, token?: string): Promise<TicketDto> => {
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<TicketDto>(res);
  },

  createTicket: async (
    data: CreateTicketDto,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketDto> => {
    const res = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify(data),
    });
    return handleResponse<TicketDto>(res);
  },

  updateTicket: async (
    id: string,
    data: UpdateTicketDto,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketDto> => {
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify(data),
    });
    return handleResponse<TicketDto>(res);
  },

  updateStatus: async (
    id: string,
    status: TicketStatus,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketDto> => {
    const res = await fetch(`${API_BASE}/tickets/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ status }),
    });
    return handleResponse<TicketDto>(res);
  },

  assignTicket: async (
    id: string,
    assignedTo: string | null,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketDto> => {
    const res = await fetch(`${API_BASE}/tickets/${id}/assign`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ assignedTo }),
    });
    return handleResponse<TicketDto>(res);
  },

  deleteTicket: async (id: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  addComment: async (
    id: string,
    message: string,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketCommentDto> => {
    const res = await fetch(`${API_BASE}/tickets/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ message }),
    });
    return handleResponse<TicketCommentDto>(res);
  },

  updateComment: async (
    commentId: string,
    message: string,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketCommentDto> => {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ message }),
    });
    return handleResponse<TicketCommentDto>(res);
  },

  deleteComment: async (commentId: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  uploadAttachment: async (
    id: string,
    file: File,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketAttachmentDto> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/tickets/${id}/attachments`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token, false),
      body: formData,
    });
    return handleResponse<TicketAttachmentDto>(res);
  },

  deleteAttachment: async (
    attachmentId: string,
    activeOrgId?: string,
    token?: string
  ): Promise<void> => {
    const res = await fetch(`${API_BASE}/attachments/${attachmentId}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  getActivity: async (
    id: string,
    activeOrgId?: string,
    token?: string
  ): Promise<TicketActivityDto[]> => {
    const res = await fetch(`${API_BASE}/tickets/${id}/activity`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<TicketActivityDto[]>(res);
  },
};
