import { prisma } from '../config/prisma';
import { PullRequestStatus, ReviewDecisionType, PRListQueryDto } from '@workspace/shared-types';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
};

export class PullRequestRepository {
  async createPullRequest(data: {
    organizationId: string;
    title: string;
    description: string;
    status: PullRequestStatus;
    createdBy: string;
    requiredApprovals?: number;
  }) {
    return prisma.pullRequest.create({
      data: {
        organizationId: data.organizationId,
        title: data.title,
        description: data.description,
        status: data.status,
        createdBy: data.createdBy,
        requiredApprovals: data.requiredApprovals || 1,
      },
      include: {
        creator: { select: userSelect },
        reviewers: { include: { reviewer: { select: userSelect } } },
      },
    });
  }

  async findPullRequestById(organizationId: string, prId: string) {
    return prisma.pullRequest.findFirst({
      where: {
        id: prId,
        organizationId,
      },
      include: {
        creator: { select: userSelect },
        merger: { select: userSelect },
        reviewers: {
          include: { reviewer: { select: userSelect } },
          orderBy: { assignedAt: 'asc' },
        },
        decisions: {
          include: { reviewer: { select: userSelect } },
          orderBy: { createdAt: 'desc' },
        },
        versions: {
          include: { creator: { select: userSelect } },
          orderBy: { versionNumber: 'desc' },
        },
        comments: {
          include: { reviewer: { select: userSelect } },
          orderBy: { createdAt: 'asc' },
        },
        activities: {
          include: { actor: { select: userSelect } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findPullRequests(organizationId: string, query: PRListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (query.search) {
      const isNum = !isNaN(Number(query.search));
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        ...(isNum ? [{ prNumber: Number(query.search) }] : []),
      ];
    }

    if (query.status) {
      where.status = Array.isArray(query.status) ? { in: query.status } : query.status;
    }

    if (query.createdBy) {
      where.createdBy = query.createdBy;
    }

    if (query.reviewerId) {
      where.reviewers = {
        some: { reviewerId: query.reviewerId },
      };
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [items, total] = await Promise.all([
      prisma.pullRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: { select: userSelect },
          merger: { select: userSelect },
          reviewers: { include: { reviewer: { select: userSelect } } },
          decisions: { include: { reviewer: { select: userSelect } } },
        },
      }),
      prisma.pullRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updatePullRequest(organizationId: string, prId: string, data: any) {
    const existing = await prisma.pullRequest.findFirst({
      where: { id: prId, organizationId },
    });
    if (!existing) return null;

    return prisma.pullRequest.update({
      where: { id: prId },
      data,
      include: {
        creator: { select: userSelect },
        merger: { select: userSelect },
        reviewers: { include: { reviewer: { select: userSelect } } },
        decisions: { include: { reviewer: { select: userSelect } } },
      },
    });
  }

  async deletePullRequest(organizationId: string, prId: string) {
    const existing = await prisma.pullRequest.findFirst({
      where: { id: prId, organizationId },
    });
    if (!existing) return false;

    await prisma.pullRequest.delete({ where: { id: prId } });
    return true;
  }

  async addReviewer(pullRequestId: string, reviewerId: string) {
    return prisma.pullRequestReviewer.upsert({
      where: { pullRequestId_reviewerId: { pullRequestId, reviewerId } },
      create: { pullRequestId, reviewerId },
      update: {},
      include: { reviewer: { select: userSelect } },
    });
  }

  async removeReviewer(pullRequestId: string, reviewerId: string) {
    await prisma.pullRequestReviewer.deleteMany({
      where: { pullRequestId, reviewerId },
    });
    return true;
  }

  async recordDecision(data: {
    pullRequestId: string;
    reviewerId: string;
    decision: ReviewDecisionType;
    comment?: string | null;
  }) {
    return prisma.reviewDecision.create({
      data: {
        pullRequestId: data.pullRequestId,
        reviewerId: data.reviewerId,
        decision: data.decision,
        comment: data.comment || null,
      },
      include: { reviewer: { select: userSelect } },
    });
  }

  async createVersion(data: {
    pullRequestId: string;
    versionNumber: number;
    title: string;
    description: string;
    createdBy: string;
  }) {
    return prisma.pullRequestVersion.create({
      data,
      include: { creator: { select: userSelect } },
    });
  }

  async createComment(pullRequestId: string, reviewerId: string, message: string) {
    return prisma.reviewComment.create({
      data: {
        pullRequestId,
        reviewerId,
        message,
      },
      include: { reviewer: { select: userSelect } },
    });
  }

  async findCommentById(commentId: string) {
    return prisma.reviewComment.findUnique({
      where: { id: commentId },
      include: {
        pullRequest: { select: { organizationId: true } },
        reviewer: { select: userSelect },
      },
    });
  }

  async updateComment(commentId: string, message: string) {
    return prisma.reviewComment.update({
      where: { id: commentId },
      data: { message },
      include: { reviewer: { select: userSelect } },
    });
  }

  async deleteComment(commentId: string) {
    await prisma.reviewComment.delete({ where: { id: commentId } });
    return true;
  }

  async createActivity(data: {
    pullRequestId: string;
    actorId: string;
    action: string;
    metadata?: string | null;
  }) {
    return prisma.pullRequestActivity.create({
      data: {
        pullRequestId: data.pullRequestId,
        actorId: data.actorId,
        action: data.action,
        metadata: data.metadata || null,
      },
      include: { actor: { select: userSelect } },
    });
  }

  async getDashboardStats(organizationId: string, currentUserId: string) {
    const [draftPRs, underReviewPRs, approvedPRs, mergedPRs, assignedToMePRs, recentPRs] =
      await Promise.all([
        prisma.pullRequest.count({ where: { organizationId, status: PullRequestStatus.DRAFT } }),
        prisma.pullRequest.count({
          where: {
            organizationId,
            status: {
              in: [
                PullRequestStatus.READY_FOR_REVIEW,
                PullRequestStatus.UNDER_REVIEW,
                PullRequestStatus.CHANGES_REQUESTED,
              ],
            },
          },
        }),
        prisma.pullRequest.count({ where: { organizationId, status: PullRequestStatus.APPROVED } }),
        prisma.pullRequest.count({ where: { organizationId, status: PullRequestStatus.MERGED } }),
        prisma.pullRequest.count({
          where: {
            organizationId,
            reviewers: { some: { reviewerId: currentUserId } },
            status: { notIn: [PullRequestStatus.MERGED, PullRequestStatus.REJECTED] },
          },
        }),
        prisma.pullRequest.findMany({
          where: { organizationId },
          take: 5,
          orderBy: { updatedAt: 'desc' },
          include: {
            creator: { select: userSelect },
            reviewers: { include: { reviewer: { select: userSelect } } },
            decisions: { include: { reviewer: { select: userSelect } } },
          },
        }),
      ]);

    return {
      draftPRs,
      underReviewPRs,
      approvedPRs,
      mergedPRs,
      assignedToMePRs,
      recentPRs,
    };
  }

  async findPullRequestByGithubId(organizationId: string, githubPrId: number) {
    return prisma.pullRequest.findFirst({
      where: {
        organizationId,
        githubPrId,
      },
    });
  }

  async updateCIStatusByCommitSha(organizationId: string, commitSha: string, ciStatus: string) {
    return prisma.pullRequest.updateMany({
      where: {
        organizationId,
        commitSha,
      },
      data: {
        ciStatus,
        checksStatus: ciStatus === 'SUCCESS' ? 'PASSED' : 'FAILED',
      },
    });
  }
}
