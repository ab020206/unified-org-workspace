import { prisma } from '../config/prisma';
import { Session } from '@prisma/client';

export class SessionRepository {
  public async createSession(
    userId: string,
    expiry: Date,
    device?: string,
    browser?: string,
    ip?: string
  ): Promise<Session> {
    return prisma.session.create({
      data: {
        userId,
        expiry,
        device,
        browser,
        ip,
        lastActivity: new Date(),
      },
    });
  }

  public async findById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { id } });
  }

  public async updateActivity(id: string): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: { lastActivity: new Date() },
    });
  }

  public async deleteSession(id: string): Promise<void> {
    await prisma.session.delete({ where: { id } }).catch(() => null);
  }

  public async deleteAllUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }

  public async deleteOtherUserSessions(userId: string, currentSessionId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });
  }

  public async listUserSessions(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId, expiry: { gt: new Date() } },
      orderBy: { lastActivity: 'desc' },
    });
  }
}
