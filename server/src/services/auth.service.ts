import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomUUID } from 'crypto';
import { env } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { SessionRepository } from '../repositories/session.repository';
import { OrganizationRepository } from '../repositories/organization.repository';
import { MemberRepository } from '../repositories/member.repository';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponseData,
  UserPayload,
  Role,
} from '@workspace/shared-types';

import { auditService } from './audit.service';

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
    private readonly tokenRepository: TokenRepository = new TokenRepository(),
    private readonly sessionRepository: SessionRepository = new SessionRepository(),
    private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
    private readonly memberRepository: MemberRepository = new MemberRepository()
  ) {}

  public formatUser(
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string | null;
      emailVerified: boolean;
      isActive: boolean;
      isPlatformUser?: boolean;
      createdAt: Date;
    },
    organizationId?: string | null
  ): UserPayload {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      isPlatformUser: Boolean(user.isPlatformUser),
      organizationId: user.isPlatformUser ? null : (organizationId ?? null),
      createdAt: user.createdAt.toISOString(),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  public generateAccessToken(userId: string, sessionId: string): string {
    return jwt.sign({ sub: userId, sid: sessionId }, env.JWT_SECRET, {
      expiresIn: '15m',
    });
  }

  public generateRefreshToken(): string {
    return randomUUID() + '.' + randomUUID();
  }

  public async register(
    data: RegisterRequest,
    meta?: { device?: string; browser?: string; ip?: string }
  ): Promise<AuthResponseData> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
    });

    // Auto-create initial default organization if specified or fallback to User's Org
    const orgName = data.organizationName || `${data.firstName}'s Workspace`;
    const baseSlug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${randomUUID().slice(0, 6)}`;

    const org = await this.organizationRepository.create({
      name: orgName,
      slug,
      createdBy: user.id,
    });

    await this.memberRepository.addMember(org.id, user.id, Role.ADMIN);

    logger.info(
      { userId: user.id, orgId: org.id },
      'User registered & default organization created'
    );

    await auditService.log({
      organizationId: org.id,
      actorId: user.id,
      actorEmail: user.email,
      actorRole: 'ADMIN',
      module: 'AUTHENTICATION',
      action: 'REGISTER',
      entityType: 'USER',
      entityId: user.id,
      newState: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ipAddress: meta?.ip,
      userAgent: meta?.browser,
    });

    return this.createAuthSession(user.id, meta);
  }

  public async login(
    data: LoginRequest,
    meta?: { browser?: string; ip?: string }
  ): Promise<AuthResponseData> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      logger.warn({ email: data.email }, 'Failed login attempt: User not found');
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      logger.warn(
        { userId: user.id, email: data.email },
        'Failed login attempt: Password mismatch'
      );
      throw ApiError.unauthorized('Invalid email or password');
    }

    logger.info({ userId: user.id }, 'User successfully logged in');

    await auditService.log({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: 'USER',
      module: 'AUTHENTICATION',
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: meta?.ip,
      userAgent: meta?.browser,
    });

    return this.createAuthSession(user.id, {
      device: data.device || 'web',
      browser: meta?.browser,
      ip: meta?.ip,
    });
  }

  private async createAuthSession(
    userId: string,
    meta?: { device?: string; browser?: string; ip?: string }
  ): Promise<AuthResponseData> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await this.sessionRepository.createSession(
      userId,
      sessionExpiry,
      meta?.device,
      meta?.browser,
      meta?.ip
    );

    const accessToken = this.generateAccessToken(userId, session.id);
    const rawRefreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(rawRefreshToken);

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.tokenRepository.createRefreshToken(userId, tokenHash, refreshExpiry, meta?.device);

    let orgId: string | null = null;
    if (!user.isPlatformUser) {
      const userOrgs = await this.organizationRepository.findUserOrganizations(userId);
      if (userOrgs.length > 0) {
        orgId = userOrgs[0].id;
      }
    }

    return {
      user: this.formatUser(user, orgId),
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
        expiresIn: 15 * 60, // 15 mins in seconds
      },
      sessionId: session.id,
    };
  }

  public async refresh(
    rawRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await this.tokenRepository.findByHash(tokenHash);

    if (!storedToken || storedToken.expiry < new Date()) {
      if (storedToken) {
        await this.tokenRepository.revokeToken(storedToken.id);
      }
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    // Revoke old refresh token (Rotation)
    await this.tokenRepository.revokeToken(storedToken.id);

    // Issue new pair
    const newRawRefreshToken = this.generateRefreshToken();
    const newTokenHash = this.hashToken(newRawRefreshToken);
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.tokenRepository.createRefreshToken(
      storedToken.userId,
      newTokenHash,
      newExpiry,
      storedToken.device || undefined
    );

    // Find active session or create new
    const sessions = await this.sessionRepository.listUserSessions(storedToken.userId);
    const sessionId =
      sessions[0]?.id ||
      (await this.sessionRepository.createSession(storedToken.userId, newExpiry)).id;

    const newAccessToken = this.generateAccessToken(storedToken.userId, sessionId);

    logger.info(
      { userId: storedToken.userId },
      'Refresh token rotated and new access token issued'
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  public async logout(rawRefreshToken?: string, sessionId?: string): Promise<void> {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      const stored = await this.tokenRepository.findByHash(tokenHash);
      if (stored) {
        await this.tokenRepository.revokeToken(stored.id);
      }
    }

    if (sessionId) {
      await this.sessionRepository.deleteSession(sessionId);
    }

    logger.info({ sessionId }, 'User logged out');
  }

  public async logoutAll(userId: string): Promise<void> {
    await this.tokenRepository.revokeAllUserTokens(userId);
    await this.sessionRepository.deleteAllUserSessions(userId);
    logger.info({ userId }, 'User logged out from all devices');
  }

  public async getMe(userId: string): Promise<UserPayload> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return this.formatUser(user);
  }
}
