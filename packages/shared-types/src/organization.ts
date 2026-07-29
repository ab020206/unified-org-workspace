import { Role } from './rbac.js';
import { UserPayload } from './auth.js';

export interface OrganizationDto {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMemberDto {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  isActive: boolean;
  user: UserPayload;
}

export interface OrganizationDetailsDto extends OrganizationDto {
  membersCount: number;
  userRole: Role;
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  logo?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  logo?: string;
}

export interface OnboardOrganizationRequest {
  name: string;
  slug?: string;
  logo?: string;
  industry?: string;
  timezone?: string;
  description?: string;
  authMode?: 'DIRECT' | 'INVITATION';
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword?: string;
}

export interface OnboardOrganizationResponse {
  organization: OrganizationDto;
  administrator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
  authMode: 'DIRECT' | 'INVITATION';
  temporaryPassword?: string;
  invitationToken?: string;
  loginUrl: string;
}

export interface InviteMemberRequest {
  email: string;
  role: Role;
}

export interface CreateMemberDirectRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phone?: string;
  department?: string;
  jobTitle?: string;
  authMode?: 'DIRECT' | 'INVITATION';
  password?: string;
}

export interface UpdateMemberRequest {
  role?: Role;
  isActive?: boolean;
}

export interface CreateMemberResponse {
  member: OrganizationMemberDto;
  authMode: 'DIRECT' | 'INVITATION';
  temporaryPassword?: string;
  invitationToken?: string;
}

export interface InvitationDto {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  invitedBy: string;
  invitedByName: string;
  role: Role;
  token: string;
  expiry: string;
  acceptedAt?: string | null;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface SwitchOrganizationRequest {
  organizationId: string;
}

export interface MultiTenantContext {
  currentOrgId: string | null;
  currentOrg: OrganizationDetailsDto | null;
  availableOrgs: OrganizationDto[];
  isLoaded: boolean;
}
