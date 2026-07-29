export enum DigestFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  NEVER = 'NEVER',
}

export interface UpdateNotificationPreferenceDto {
  emailDigestFrequency?: DigestFrequency;
  emailInstantEvents?: boolean;
  pushEnabled?: boolean;
  eventPreferences?: Record<string, boolean>;
}

export interface SavePushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}
