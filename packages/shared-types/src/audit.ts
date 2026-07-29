import { UserSummaryDto } from './ticket.js';

export enum AuditModule {
  AUTHENTICATION = 'AUTHENTICATION',
  ORGANIZATION = 'ORGANIZATION',
  SUPPORT_HUB = 'SUPPORT_HUB',
  REVIEW_CONSOLE = 'REVIEW_CONSOLE',
  PLATFORM = 'PLATFORM',
  SYSTEM = 'SYSTEM',
}

export interface AuditMetadataDto {
  id: string;
  auditId: string;
  key: string;
  value: string;
}

export interface AuditLogDto {
  id: string;
  organizationId?: string | null;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  module: AuditModule | string;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  createdAt: string;
  actor?: UserSummaryDto;
  metadata?: AuditMetadataDto[];
}

export interface AuditListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  module?: AuditModule | string;
  action?: string;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'module' | 'action';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAuditResponse {
  items: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditDashboardStatsDto {
  totalEvents: number;
  authEvents: number;
  ticketEvents: number;
  reviewEvents: number;
  recentActivity: AuditLogDto[];
}
