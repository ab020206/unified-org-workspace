export interface UserPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  emailVerified: boolean;
  isActive: boolean;
  isPlatformUser?: boolean;
  organizationId?: string | null;
  createdAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device?: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponseData {
  user: UserPayload;
  tokens: AuthTokens;
  sessionId: string;
}

export interface SessionPayload {
  id: string;
  device?: string | null;
  browser?: string | null;
  ip?: string | null;
  lastActivity: string;
  createdAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
