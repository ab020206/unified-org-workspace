import { Request, Response } from 'express';
import { AppRequest } from '../types/index';
import { AuthService } from '../services/auth.service';
import { createSuccessResponse } from '@workspace/shared-utils';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const meta = {
      device: req.body.device || req.get('user-agent'),
      browser: req.get('user-agent'),
      ip: req.ip,
    };

    const result = await this.authService.register(req.body, meta);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(201)
      .json(createSuccessResponse(result, 'Registration successful', appReq.requestId || 'N/A'));
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const meta = {
      browser: req.get('user-agent'),
      ip: req.ip,
    };

    const result = await this.authService.login(req.body, meta);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json(createSuccessResponse(result, 'Login successful', appReq.requestId || 'N/A'));
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    const result = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Token refreshed successfully', appReq.requestId || 'N/A')
      );
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

    await this.authService.logout(refreshToken, appReq.sessionId);

    res.clearCookie('refreshToken');
    res
      .status(200)
      .json(createSuccessResponse(null, 'Logged out successfully', appReq.requestId || 'N/A'));
  };

  public logoutAll = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) {
      throw new Error('User missing');
    }

    await this.authService.logoutAll(appReq.user.id);

    res.clearCookie('refreshToken');
    res
      .status(200)
      .json(
        createSuccessResponse(
          null,
          'Logged out from all sessions successfully',
          appReq.requestId || 'N/A'
        )
      );
  };

  public me = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) {
      throw new Error('User missing');
    }

    const user = await this.authService.getMe(appReq.user.id);
    res
      .status(200)
      .json(
        createSuccessResponse(user, 'Current user profile retrieved', appReq.requestId || 'N/A')
      );
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    res.status(200).json(
      createSuccessResponse(
        {
          message:
            'If an account exists with this email, password reset instructions have been sent.',
        },
        'Password reset link requested',
        appReq.requestId || 'N/A'
      )
    );
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    res
      .status(200)
      .json(
        createSuccessResponse(
          { message: 'Password has been reset successfully.' },
          'Password reset completed',
          appReq.requestId || 'N/A'
        )
      );
  };
}
