import { Request, Response } from 'express';
import { AppRequest } from '../types/index';
import { SessionRepository } from '../repositories/session.repository';
import { AuthService } from '../services/auth.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import { SecuritySessionPayload } from '@workspace/shared-types';
import { ApiError } from '../utils/apiError';

export class SecurityController {
  constructor(
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly authService: AuthService = new AuthService()
  ) {}

  public getActiveSessions = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const sessions = await this.sessionRepository.listUserSessions(appReq.user.id);
    const formatted: SecuritySessionPayload[] = sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      device: s.device,
      browser: s.browser,
      ip: s.ip,
      lastActivity: s.lastActivity.toISOString(),
      expiry: s.expiry.toISOString(),
      createdAt: s.createdAt.toISOString(),
      isCurrent: s.id === appReq.sessionId,
    }));

    res.json(
      createSuccessResponse(
        formatted,
        'Active sessions retrieved successfully',
        appReq.requestId || 'N/A'
      )
    );
  };

  public revokeSession = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const { sessionId } = req.params;

    if (!appReq.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.userId !== appReq.user.id) {
      throw ApiError.notFound('Session not found or not owned by user');
    }

    await this.sessionRepository.deleteSession(sessionId);

    res.json(
      createSuccessResponse(null, 'Session revoked successfully', appReq.requestId || 'N/A')
    );
  };

  public logoutAllDevices = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    await this.authService.logoutAll(appReq.user.id);

    res.json(
      createSuccessResponse(
        null,
        'Successfully logged out from all devices',
        appReq.requestId || 'N/A'
      )
    );
  };
}
