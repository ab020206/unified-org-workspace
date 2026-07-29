export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export function getAuthHeaders(
  token?: string,
  orgId?: string,
  isJson = true
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';

  const storedToken =
    token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const activeOrgId =
    orgId || (typeof window !== 'undefined' ? localStorage.getItem('activeOrgId') : null);
  if (activeOrgId) {
    headers['X-Organization-Id'] = activeOrgId;
  }

  return headers;
}
