export interface AuditAnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
  organizationId?: string;
  userId?: string;
  role?: string;
  actionType?: string;
  severity?: string;
  entityType?: string;
}

export interface AuditAnalyticsSummaryDto {
  totalLogins: number;
  orgsCreated: number;
  usersCreated: number;
  ticketsCreated: number;
  reviewsCreated: number;
  reviewsApproved: number;
  reviewsRejected: number;
  featureFlagChanges: number;
  permissionChanges: number;
  mostActiveUsers: Array<{ userId: string; email: string; actionCount: number }>;
  mostActiveOrgs: Array<{ organizationId: string; orgName: string; actionCount: number }>;
  mostFrequentActions: Array<{ action: string; count: number }>;
  activityTimeline: Array<{ date: string; count: number }>;
  actionDistribution: Array<{ category: string; count: number }>;
}

export interface AnomalyAlertDto {
  id: string;
  organizationId?: string | null;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  metadata?: any;
  acknowledged: boolean;
  acknowledgedBy?: string | null;
  acknowledgedAt?: string | Date | null;
  createdAt: string | Date;
}
