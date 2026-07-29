import { Request, Response, NextFunction } from 'express';
import { UserPayload, OrganizationDetailsDto, Role, Permission } from '@workspace/shared-types';

export interface AppRequest extends Request {
  requestId?: string;
  startTime?: number;
  user?: UserPayload;
  sessionId?: string;
  organization?: OrganizationDetailsDto;
  membership?: {
    id: string;
    organizationId: string;
    userId: string;
    role: Role;
    joinedAt: string;
    isActive: boolean;
  };
  permissions?: Permission[];
}

export type AppRequestHandler = (
  req: AppRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type AppErrorRequestHandler = (
  err: Error,
  req: AppRequest,
  res: Response,
  next: NextFunction
) => void;
