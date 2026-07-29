import { UserSummaryDto } from './ticket.js';

export enum PullRequestStatus {
  DRAFT = 'DRAFT',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MERGED = 'MERGED',
}

export enum ReviewDecisionType {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  REJECTED = 'REJECTED',
}

export interface PullRequestReviewerDto {
  id: string;
  pullRequestId: string;
  reviewerId: string;
  assignedAt: string;
  reviewer?: UserSummaryDto;
}

export interface ReviewDecisionDto {
  id: string;
  pullRequestId: string;
  reviewerId: string;
  decision: ReviewDecisionType;
  comment?: string | null;
  createdAt: string;
  reviewer?: UserSummaryDto;
}

export interface PullRequestVersionDto {
  id: string;
  pullRequestId: string;
  versionNumber: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  creator?: UserSummaryDto;
}

export interface ReviewCommentDto {
  id: string;
  pullRequestId: string;
  reviewerId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: UserSummaryDto;
}

export interface PullRequestActivityDto {
  id: string;
  pullRequestId: string;
  actorId: string;
  action: string;
  metadata?: string | null;
  createdAt: string;
  actor?: UserSummaryDto;
}

export interface PullRequestDto {
  id: string;
  organizationId: string;
  prNumber: number;
  title: string;
  description: string;
  status: PullRequestStatus;
  createdBy: string;
  mergedBy?: string | null;
  requiredApprovals: number;
  mergedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: UserSummaryDto;
  merger?: UserSummaryDto | null;
  reviewers?: PullRequestReviewerDto[];
  decisions?: ReviewDecisionDto[];
  versions?: PullRequestVersionDto[];
  comments?: ReviewCommentDto[];
  activities?: PullRequestActivityDto[];
  approvalCount?: number;
}

export interface CreatePullRequestDto {
  title: string;
  description: string;
  requiredApprovals?: number;
  reviewerIds?: string[];
  isDraft?: boolean;
}

export interface UpdatePullRequestDto {
  title?: string;
  description?: string;
  requiredApprovals?: number;
}

export interface SubmitReviewDecisionDto {
  decision: ReviewDecisionType;
  comment?: string;
}

export interface AssignReviewersDto {
  reviewerIds: string[];
}

export interface CreatePRCommentDto {
  message: string;
}

export interface PRListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: PullRequestStatus | PullRequestStatus[];
  createdBy?: string;
  reviewerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'prNumber' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPRResponse {
  items: PullRequestDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PRDashboardStatsDto {
  draftPRs: number;
  underReviewPRs: number;
  approvedPRs: number;
  mergedPRs: number;
  assignedToMePRs: number;
  recentPRs: PullRequestDto[];
}
