import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppRequest } from '../types/index';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../utils/apiError';

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const authService = new AuthService();

export const authenticate: RequestHandler = async (req, _res, next) => {
  const appReq = req as AppRequest;

  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is missing');
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; sid: string };

    // Verify session validity in DB
    const session = await sessionRepository.findById(payload.sid);
    if (!session || session.expiry < new Date()) {
      throw ApiError.unauthorized('Session has expired or is invalid');
    }

    // Verify user status
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User account is invalid or deactivated');
    }

    // Touch session activity
    await sessionRepository.updateActivity(session.id);

    appReq.user = authService.formatUser(user);
    appReq.sessionId = session.id;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid or expired authentication token'));
    } else {
      next(error);
    }
  }
};
