import { prisma } from '../config/prisma';
import { RefreshToken } from '@prisma/client';

export class TokenRepository {
  public async createRefreshToken(
    userId: string,
    tokenHash: string,
    expiry: Date,
    device?: string
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiry,
        device,
        revoked: false,
      },
    });
  }

  public async findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false },
    });
  }

  public async revokeToken(id: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  }

  public async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }
}
