export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
