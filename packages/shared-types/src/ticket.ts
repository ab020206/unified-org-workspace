export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_RESPONSE = 'WAITING_FOR_RESPONSE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketCategory {
  GENERAL = 'GENERAL',
  BUG = 'BUG',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BILLING = 'BILLING',
  TECHNICAL = 'TECHNICAL',
  ACCOUNT = 'ACCOUNT',
  OTHER = 'OTHER',
}

export interface UserSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
}

export interface TicketCommentDto {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  user?: UserSummaryDto;
}

export interface TicketAttachmentDto {
  id: string;
  ticketId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  uploader?: UserSummaryDto;
}

export interface TicketActivityDto {
  id: string;
  ticketId: string;
  actorId: string;
  action: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdAt: string;
  actor?: UserSummaryDto;
}

export interface TicketDto {
  id: string;
  organizationId: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdBy: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  creator?: UserSummaryDto;
  assignee?: UserSummaryDto | null;
  comments?: TicketCommentDto[];
  attachments?: TicketAttachmentDto[];
  activities?: TicketActivityDto[];
}

export interface CreateTicketDto {
  title: string;
  description: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  assignedTo?: string | null;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}

export interface UpdateTicketStatusDto {
  status: TicketStatus;
}

export interface AssignTicketDto {
  assignedTo: string | null;
}

export interface CreateCommentDto {
  message: string;
}

export interface UpdateCommentDto {
  message: string;
}

export interface TicketListQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority | TicketPriority[];
  category?: TicketCategory | TicketCategory[];
  assignedTo?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'ticketNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTicketResponse {
  items: TicketDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TicketDashboardStatsDto {
  totalTickets: number;
  openTickets: number;
  assignedToMeTickets: number;
  recentlyUpdatedTickets: TicketDto[];
}
