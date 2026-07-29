import { prisma } from '../config/prisma';
import { DigestStatus } from '@workspace/shared-types';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
};

export class DigestRepository {
  async createDigest(data: {
    organizationId: string;
    userId: string;
    title: string;
    summary: string;
    status: DigestStatus;
    modelUsed?: string;
    tokenUsage?: number;
    expiresAt?: Date;
  }) {
    return prisma.digest.create({
      data: {
        organizationId: data.organizationId,
        userId: data.userId,
        title: data.title,
        summary: data.summary,
        status: data.status,
        modelUsed: data.modelUsed || 'gemini-1.5-flash',
        tokenUsage: data.tokenUsage || 0,
        expiresAt: data.expiresAt || new Date(Date.now() + 24 * 3600 * 1000), // Expires in 24h
      },
      include: {
        user: { select: userSelect },
      },
    });
  }

  async findLatestActiveDigest(organizationId: string, userId: string) {
    const digest = await prisma.digest.findFirst({
      where: {
        organizationId,
        userId,
        status: DigestStatus.READY,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: userSelect },
      },
    });
    return digest;
  }

  async updateDigestStatus(
    digestId: string,
    status: DigestStatus,
    summary?: string,
    tokenUsage?: number
  ) {
    return prisma.digest.update({
      where: { id: digestId },
      data: {
        status,
        summary: summary || undefined,
        tokenUsage: tokenUsage || undefined,
        generatedAt: status === DigestStatus.READY ? new Date() : undefined,
      },
    });
  }

  async listDigestHistory(organizationId: string, userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.digest.findMany({
        where: { organizationId, userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.digest.count({ where: { organizationId, userId } }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async logJobHistory(data: {
    queue: string;
    jobType: string;
    status: string;
    errorMessage?: string;
  }) {
    return prisma.jobHistory.create({
      data: {
        queue: data.queue,
        jobType: data.jobType,
        status: data.status,
        errorMessage: data.errorMessage,
        completedAt: new Date(),
      },
    });
  }
}
