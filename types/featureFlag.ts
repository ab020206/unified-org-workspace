export enum FeatureFlagKey {
  AI_DIGEST = 'AI_DIGEST',
  CROSS_ORG_SHARING = 'CROSS_ORG_SHARING',
  REVIEW_CONSOLE = 'REVIEW_CONSOLE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  ADVANCED_ANALYTICS = 'ADVANCED_ANALYTICS',
}

export interface FeatureFlagPayload {
  id: string;
  key: FeatureFlagKey | string;
  description?: string | null;
  enabled: boolean;
  organizationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagToggleRequest {
  enabled: boolean;
  organizationId?: string;
  description?: string;
}

export interface SecuritySessionPayload {
  id: string;
  userId: string;
  device?: string | null;
  browser?: string | null;
  ip?: string | null;
  lastActivity: string;
  expiry: string;
  createdAt: string;
  isCurrent?: boolean;
}
