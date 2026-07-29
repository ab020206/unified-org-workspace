'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserPayload,
  OrganizationDetailsDto,
  OrganizationDto,
  OrganizationMemberDto,
  LoginRequest,
  RegisterRequest,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OnboardOrganizationRequest,
  OnboardOrganizationResponse,
  CreateMemberDirectRequest,
  UpdateMemberRequest,
  CreateMemberResponse,
  InviteMemberRequest,
  InvitationDto,
  ApiResponse,
  AuthResponseData,
  Permission,
  Role,
  DEFAULT_ROLE_PERMISSIONS,
} from '@workspace/shared-types';

interface AuthContextType {
  user: UserPayload | null;
  activeOrganization: OrganizationDetailsDto | null;
  userOrganizations: OrganizationDto[];
  members: OrganizationMemberDto[];
  permissions: Permission[];
  accessToken: string | null;
  isLoading: boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (data: CreateOrganizationRequest) => Promise<OrganizationDetailsDto>;
  updateOrganization: (orgId: string, data: UpdateOrganizationRequest) => Promise<OrganizationDetailsDto>;
  onboardOrganization: (data: OnboardOrganizationRequest) => Promise<OnboardOrganizationResponse>;
  createMemberDirect: (data: CreateMemberDirectRequest) => Promise<CreateMemberResponse>;
  updateMember: (memberId: string, data: UpdateMemberRequest) => Promise<OrganizationMemberDto>;
  removeMember: (memberId: string) => Promise<void>;
  resetMemberPassword: (memberId: string) => Promise<{ temporaryPassword: string }>;
  listInvitations: () => Promise<InvitationDto[]>;
  resendInvitation: (invitationId: string) => Promise<InvitationDto>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  inviteMember: (data: InviteMemberRequest) => Promise<void>;
  acceptInvitation: (token: string) => Promise<void>;
  refreshContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:4000/api/v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [activeOrganization, setActiveOrganization] = useState<OrganizationDetailsDto | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<OrganizationDto[]>([]);
  const [members, setMembers] = useState<OrganizationMemberDto[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derive effective role (Platform Super Admin vs Tenant Role)
  const effectiveRole = useMemo(() => {
    if (user?.isPlatformUser) return Role.SUPER_ADMIN;
    return activeOrganization?.userRole as Role | undefined;
  }, [user?.isPlatformUser, activeOrganization?.userRole]);

  // Derive permissions from effective role
  const permissions = useMemo(() => {
    if (effectiveRole === Role.SUPER_ADMIN) return Object.values(Permission);
    if (!effectiveRole) return [];
    return DEFAULT_ROLE_PERMISSIONS[effectiveRole] || [];
  }, [effectiveRole]);

  const hasPermission = useCallback(
    (required: Permission | Permission[]): boolean => {
      if (effectiveRole === Role.SUPER_ADMIN) return true;
      if (!permissions.length) return false;
      const requiredArr = Array.isArray(required) ? required : [required];
      return requiredArr.every((p) => permissions.includes(p));
    },
    [effectiveRole, permissions]
  );

  const hasRole = useCallback(
    (allowed: Role | Role[]): boolean => {
      if (!effectiveRole) return false;
      const allowedArr = Array.isArray(allowed) ? allowed : [allowed];
      return allowedArr.includes(effectiveRole);
    },
    [effectiveRole]
  );

  const authFetch = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      const storedToken =
        accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`;
      }

      const activeOrgId =
        activeOrganization?.id ||
        (typeof window !== 'undefined' ? localStorage.getItem('activeOrgId') : null);
      if (activeOrgId) {
        headers['X-Organization-Id'] = activeOrgId;
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({ message: 'API request failed' }));
        throw new Error(errorJson.message || 'API request failed');
      }

      return res.json();
    },
    [accessToken, activeOrganization?.id]
  );

  const fetchActiveOrgAndMembers = useCallback(async (token: string, orgId?: string) => {
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      if (orgId) headers['X-Organization-Id'] = orgId;

      const orgsRes: ApiResponse<OrganizationDto[]> = await fetch(`${API_BASE}/organizations`, {
        headers,
      }).then((r) => r.json());
      if (orgsRes.success) {
        setUserOrganizations(orgsRes.data);
      }

      const currentOrgRes: ApiResponse<OrganizationDetailsDto> = await fetch(
        `${API_BASE}/organizations/current`,
        { headers }
      ).then((r) => r.json());
      if (currentOrgRes.success) {
        setActiveOrganization(currentOrgRes.data);
        localStorage.setItem('activeOrgId', currentOrgRes.data.id);

        const membersRes: ApiResponse<OrganizationMemberDto[]> = await fetch(
          `${API_BASE}/organizations/members`,
          { headers }
        ).then((r) => r.json());
        if (membersRes.success) {
          setMembers(membersRes.data);
        }
      }
    } catch (err) {
      console.warn('Failed to load organization context:', err);
    }
  }, []);

  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setIsLoading(false);
        return;
      }

      const meRes: ApiResponse<UserPayload> = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      if (meRes.success) {
        setUser(meRes.data);
        setAccessToken(token);
        const storedOrgId = localStorage.getItem('activeOrgId') || undefined;
        await fetchActiveOrgAndMembers(token, storedOrgId);
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch {
      localStorage.removeItem('accessToken');
    } finally {
      setIsLoading(false);
    }
  }, [fetchActiveOrgAndMembers]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const json: ApiResponse<AuthResponseData> = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) return r.json().then((err) => Promise.reject(new Error(err.message)));
        return r.json();
      });

      const token = json.data.tokens.accessToken;
      setUser(json.data.user);
      setAccessToken(token);
      localStorage.setItem('accessToken', token);

      await fetchActiveOrgAndMembers(token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const json: ApiResponse<AuthResponseData> = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) return r.json().then((err) => Promise.reject(new Error(err.message)));
        return r.json();
      });

      const token = json.data.tokens.accessToken;
      setUser(json.data.user);
      setAccessToken(token);
      localStorage.setItem('accessToken', token);

      await fetchActiveOrgAndMembers(token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch {
      // Ignore network failures on logout
    } finally {
      setUser(null);
      setActiveOrganization(null);
      setUserOrganizations([]);
      setMembers([]);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('activeOrgId');
    }
  };

  const switchOrganization = async (orgId: string) => {
    const json: ApiResponse<OrganizationDetailsDto> = await authFetch('/organizations/switch', {
      method: 'PATCH',
      body: JSON.stringify({ organizationId: orgId }),
    });

    if (json.success) {
      setActiveOrganization(json.data);
      localStorage.setItem('activeOrgId', json.data.id);
      const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
      if (token) {
        await fetchActiveOrgAndMembers(token, json.data.id);
      }
    }
  };

  const createOrganization = async (data: CreateOrganizationRequest) => {
    const json: ApiResponse<OrganizationDetailsDto> = await authFetch('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (json.success) {
      await switchOrganization(json.data.id);
      return json.data;
    }
    throw new Error(json.message || 'Failed to create organization');
  };

  const updateOrganization = async (orgId: string, data: UpdateOrganizationRequest) => {
    const json: ApiResponse<OrganizationDetailsDto> = await authFetch(`/organizations/${orgId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (json.success) {
      if (activeOrganization?.id === orgId) {
        setActiveOrganization(json.data);
      }
      setUserOrganizations((prev) =>
        prev.map((o) =>
          o.id === orgId ? { ...o, name: json.data.name, slug: json.data.slug, logo: json.data.logo } : o
        )
      );
      return json.data;
    }
    throw new Error(json.message || 'Failed to update organization');
  };

  const onboardOrganization = async (data: OnboardOrganizationRequest) => {
    const json: ApiResponse<OnboardOrganizationResponse> = await authFetch('/organizations/onboard', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (json.success) {
      await refreshContext();
      return json.data;
    }
    throw new Error(json.message || 'Failed to onboard organization');
  };

  const createMemberDirect = async (data: CreateMemberDirectRequest) => {
    const json: ApiResponse<CreateMemberResponse> = await authFetch('/organizations/members/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (json.success) {
      await refreshContext();
      return json.data;
    }
    throw new Error(json.message || 'Failed to create member');
  };

  const updateMember = async (memberId: string, data: UpdateMemberRequest) => {
    const json: ApiResponse<OrganizationMemberDto> = await authFetch(`/organizations/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (json.success) {
      await refreshContext();
      return json.data;
    }
    throw new Error(json.message || 'Failed to update member');
  };

  const removeMember = async (memberId: string) => {
    const json: ApiResponse<null> = await authFetch(`/organizations/members/${memberId}`, {
      method: 'DELETE',
    });

    if (json.success) {
      await refreshContext();
      return;
    }
    throw new Error(json.message || 'Failed to remove member');
  };

  const resetMemberPassword = async (memberId: string) => {
    const json: ApiResponse<{ temporaryPassword: string }> = await authFetch(
      `/organizations/members/${memberId}/reset-password`,
      {
        method: 'POST',
      }
    );

    if (json.success) {
      return json.data;
    }
    throw new Error(json.message || 'Failed to reset password');
  };

  const listInvitations = async () => {
    const json: ApiResponse<InvitationDto[]> = await authFetch('/organizations/invitations', {
      method: 'GET',
    });

    if (json.success) {
      return json.data;
    }
    throw new Error(json.message || 'Failed to list invitations');
  };

  const resendInvitation = async (invitationId: string) => {
    const json: ApiResponse<InvitationDto> = await authFetch(
      `/organizations/invitations/${invitationId}/resend`,
      {
        method: 'POST',
      }
    );

    if (json.success) {
      return json.data;
    }
    throw new Error(json.message || 'Failed to resend invitation');
  };

  const cancelInvitation = async (invitationId: string) => {
    const json: ApiResponse<null> = await authFetch(`/organizations/invitations/${invitationId}`, {
      method: 'DELETE',
    });

    if (json.success) {
      return;
    }
    throw new Error(json.message || 'Failed to cancel invitation');
  };

  const inviteMember = async (data: InviteMemberRequest) => {
    await authFetch('/organizations/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const acceptInvitation = async (token: string) => {
    const json: ApiResponse<OrganizationDetailsDto> = await authFetch('/organizations/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (json.success) {
      await switchOrganization(json.data.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrganization,
        userOrganizations,
        members,
        permissions,
        accessToken,
        isLoading,
        hasPermission,
        hasRole,
        login,
        register,
        logout,
        switchOrganization,
        createOrganization,
        updateOrganization,
        onboardOrganization,
        createMemberDirect,
        updateMember,
        removeMember,
        resetMemberPassword,
        listInvitations,
        resendInvitation,
        cancelInvitation,
        inviteMember,
        acceptInvitation,
        refreshContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
