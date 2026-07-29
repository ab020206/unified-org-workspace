import { Request } from 'express';
import { Role } from '@workspace/shared-types';

export interface AppRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isPlatformUser?: boolean;
  };
  organization?: any;
  membership?: {
    id: string;
    organizationId: string;
    userId: string;
    role: Role;
    joinedAt: string;
    isActive: boolean;
  };
  permissions?: string[];
  startTime?: number;
  sessionId?: string;
  requestId?: string;
}

export * from '@/types';
