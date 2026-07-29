import { UserSummaryDto, OrganizationDto } from './index.js';

export enum OrganizationConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED',
  REVOKED = 'REVOKED',
}

export enum SharedResourceType {
  TICKET = 'TICKET',
  PULL_REQUEST = 'PULL_REQUEST',
}

export enum SharePermission {
  READ = 'READ',
  COMMENT = 'COMMENT',
  REVIEW = 'REVIEW',
  APPROVE = 'APPROVE',
  FULL_ACCESS = 'FULL_ACCESS',
}

export interface OrganizationConnectionDto {
  id: string;
  sourceOrganizationId: string;
  targetOrganizationId: string;
  status: OrganizationConnectionStatus;
  requestedBy: string;
  approvedBy?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  sourceOrg?: OrganizationDto;
  targetOrg?: OrganizationDto;
  requester?: UserSummaryDto;
  approver?: UserSummaryDto | null;
}

export interface SharedResourceDto {
  id: string;
  resourceType: SharedResourceType;
  resourceId: string;
  ownerOrganizationId: string;
  sharedWithOrganizationId: string;
  permission: SharePermission;
  expiresAt?: string | null;
  sharedBy: string;
  createdAt: string;
  ownerOrg?: OrganizationDto;
  sharedWithOrg?: OrganizationDto;
  sharer?: UserSummaryDto;
  resourceDetails?: any;
}

export interface SharedAccessDto {
  id: string;
  sharedResourceId: string;
  guestUserId: string;
  permission: SharePermission;
  acceptedAt: string;
  lastAccessedAt: string;
  guestUser?: UserSummaryDto;
}

export interface CreateConnectionRequestDto {
  targetOrganizationIdOrSlug: string;
}

export interface CreateShareDto {
  resourceType: SharedResourceType;
  resourceId: string;
  targetOrganizationId: string;
  permission?: SharePermission;
  expiresAt?: string;
}

export interface UpdateShareDto {
  permission?: SharePermission;
  expiresAt?: string | null;
}

export interface SharedResourcesFeedDto {
  incomingShares: SharedResourceDto[];
  outgoingShares: SharedResourceDto[];
  connections: OrganizationConnectionDto[];
  pendingRequests: OrganizationConnectionDto[];
}
