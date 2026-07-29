import {
  PullRequestDto,
  PaginatedPRResponse,
  PRDashboardStatsDto,
  CreatePullRequestDto,
  UpdatePullRequestDto,
  ReviewCommentDto,
  PullRequestVersionDto,
  PullRequestActivityDto,
  ApiResponse,
  PRListQueryDto,
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

export const pullRequestApi = {
  getPullRequests: async (
    query?: PRListQueryDto,
    activeOrgId?: string,
    token?: string
  ): Promise<PaginatedPRResponse> => {
    const params = new URLSearchParams();
    if (query) {
      if (query.page) params.set('page', query.page.toString());
      if (query.limit) params.set('limit', query.limit.toString());
      if (query.search) params.set('search', query.search);
      if (query.createdBy) params.set('createdBy', query.createdBy);
      if (query.reviewerId) params.set('reviewerId', query.reviewerId);
      if (query.startDate) params.set('startDate', query.startDate);
      if (query.endDate) params.set('endDate', query.endDate);
      if (query.sortBy) params.set('sortBy', query.sortBy);
      if (query.sortOrder) params.set('sortOrder', query.sortOrder);

      if (query.status) {
        const statuses = Array.isArray(query.status) ? query.status : [query.status];
        statuses.forEach((s) => params.append('status', s));
      }
    }

    const res = await fetch(`${API_BASE}/pull-requests?${params.toString()}`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PaginatedPRResponse>(res);
  },

  getStats: async (activeOrgId?: string, token?: string): Promise<PRDashboardStatsDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/stats`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PRDashboardStatsDto>(res);
  },

  getPullRequestById: async (
    id: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PullRequestDto>(res);
  },

  createPullRequest: async (
    data: CreatePullRequestDto,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify(data),
    });
    return handleResponse<PullRequestDto>(res);
  },

  updatePullRequest: async (
    id: string,
    data: UpdatePullRequestDto,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify(data),
    });
    return handleResponse<PullRequestDto>(res);
  },

  deletePullRequest: async (id: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  submitForReview: async (
    id: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/submit`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PullRequestDto>(res);
  },

  approvePR: async (
    id: string,
    comment?: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/approve`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ comment }),
    });
    return handleResponse<PullRequestDto>(res);
  },

  rejectPR: async (
    id: string,
    comment?: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/reject`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ comment }),
    });
    return handleResponse<PullRequestDto>(res);
  },

  requestChanges: async (
    id: string,
    comment?: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/request-changes`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ comment }),
    });
    return handleResponse<PullRequestDto>(res);
  },

  mergePR: async (id: string, activeOrgId?: string, token?: string): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/merge`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PullRequestDto>(res);
  },

  addReviewers: async (
    id: string,
    reviewerIds: string[],
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/reviewers`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ reviewerIds }),
    });
    return handleResponse<PullRequestDto>(res);
  },

  removeReviewer: async (
    id: string,
    reviewerId: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/reviewers/${reviewerId}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PullRequestDto>(res);
  },

  addComment: async (
    id: string,
    message: string,
    activeOrgId?: string,
    token?: string
  ): Promise<ReviewCommentDto> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ message }),
    });
    return handleResponse<ReviewCommentDto>(res);
  },

  updateComment: async (
    commentId: string,
    message: string,
    activeOrgId?: string,
    token?: string
  ): Promise<ReviewCommentDto> => {
    const res = await fetch(`${API_BASE}/pr-comments/${commentId}`, {
      method: 'PATCH',
      headers: getHeaders(activeOrgId, token),
      body: JSON.stringify({ message }),
    });
    return handleResponse<ReviewCommentDto>(res);
  },

  deleteComment: async (commentId: string, activeOrgId?: string, token?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/pr-comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(activeOrgId, token),
    });
    await handleResponse(res);
  },

  getVersions: async (
    id: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestVersionDto[]> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/versions`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PullRequestVersionDto[]>(res);
  },

  getActivity: async (
    id: string,
    activeOrgId?: string,
    token?: string
  ): Promise<PullRequestActivityDto[]> => {
    const res = await fetch(`${API_BASE}/pull-requests/${id}/activity`, {
      headers: getHeaders(activeOrgId, token),
    });
    return handleResponse<PullRequestActivityDto[]>(res);
  },
};
