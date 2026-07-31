export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export function getAuthHeaders(
  tokenOrOrgId?: string,
  orgId?: string,
  isJson = true
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (isJson) headers['Content-Type'] = 'application/json';

  let explicitToken: string | undefined;
  let explicitOrgId: string | undefined;

  if (tokenOrOrgId && !orgId && (tokenOrOrgId.startsWith('org_') || tokenOrOrgId.includes('-') || tokenOrOrgId.length > 15)) {
    explicitOrgId = tokenOrOrgId;
  } else {
    explicitToken = tokenOrOrgId;
    explicitOrgId = orgId;
  }

  const storedToken =
    explicitToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const activeOrgId =
    explicitOrgId || (typeof window !== 'undefined' ? localStorage.getItem('activeOrgId') : null);
  if (activeOrgId) {
    headers['X-Organization-Id'] = activeOrgId;
  }

  return headers;
}
