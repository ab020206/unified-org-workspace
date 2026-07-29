import { UserSummaryDto, OrganizationDto } from './index.js';

export enum DigestStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  READY = 'READY',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum NotificationType {
  AI_DIGEST = 'AI_DIGEST',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  REVIEW_ASSIGNED = 'REVIEW_ASSIGNED',
  REVIEW_APPROVED = 'REVIEW_APPROVED',
  SHARE_RECEIVED = 'SHARE_RECEIVED',
  SYSTEM = 'SYSTEM',
  SECURITY = 'SECURITY',
}

export interface DigestDto {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  summary: string;
  generatedAt: string;
  expiresAt?: string | null;
  status: DigestStatus;
  modelUsed: string;
  tokenUsage?: number | null;
  createdAt: string;
  organization?: OrganizationDto;
  user?: UserSummaryDto;
}

export interface NotificationDto {
  id: string;
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: string;
}

export interface NotificationListQueryDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}

export interface DigestHistoryQueryDto {
  page?: number;
  limit?: number;
}
