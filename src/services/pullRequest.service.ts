import { PullRequestRepository } from '../repositories/pullRequest.repository';
import { auditService } from './audit.service';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import {
  PullRequestStatus,
  ReviewDecisionType,
  CreatePullRequestDto,
  UpdatePullRequestDto,
  PRListQueryDto,
  SharePermission,
} from '@workspace/shared-types';

export class PullRequestService {
  private prRepository: PullRequestRepository;

  constructor() {
    this.prRepository = new PullRequestRepository();
  }

  private calculateApprovalCount(
    decisions: Array<{ reviewerId: string; decision: string; createdAt?: Date | string }>
  ): number {
    // Sort decisions descending by createdAt so the newest decision per reviewer takes precedence
    const sortedDecisions = [...(decisions || [])].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    // Map reviewer ID to their latest decision
    const latestDecisions = new Map<string, string>();
    for (const d of sortedDecisions) {
      if (!latestDecisions.has(d.reviewerId)) {
        latestDecisions.set(d.reviewerId, d.decision);
      }
    }

    let approvedCount = 0;
    for (const decision of latestDecisions.values()) {
      if (decision === ReviewDecisionType.APPROVED) {
        approvedCount++;
      }
    }
    return approvedCount;
  }

  async createPullRequest(
    organizationId: string,
    currentUserId: string,
    dto: CreatePullRequestDto
  ) {
    let initialStatus = PullRequestStatus.DRAFT;
    if (!dto.isDraft) {
      initialStatus =
        dto.reviewerIds && dto.reviewerIds.length > 0
          ? PullRequestStatus.UNDER_REVIEW
          : PullRequestStatus.READY_FOR_REVIEW;
    }

    const pr = await this.prRepository.createPullRequest({
      organizationId,
      title: dto.title,
      description: dto.description,
      status: initialStatus,
      createdBy: currentUserId,
      requiredApprovals: dto.requiredApprovals || 1,
    });

    // Create initial Version 1
    await this.prRepository.createVersion({
      pullRequestId: pr.id,
      versionNumber: 1,
      title: pr.title,
      description: pr.description,
      createdBy: currentUserId,
    });

    // Assign reviewers if provided
    if (dto.reviewerIds && dto.reviewerIds.length > 0) {
      for (const reviewerId of dto.reviewerIds) {
        await this.prRepository.addReviewer(pr.id, reviewerId);
      }
    }

    // Log Activity
    await this.prRepository.createActivity({
      pullRequestId: pr.id,
      actorId: currentUserId,
      action: 'PR_CREATED',
      metadata: pr.title,
    });

    await auditService.log({
      organizationId,
      actorId: currentUserId,
      actorEmail: pr.creator?.email || 'user@example.com',
      actorRole: 'USER',
      module: 'REVIEW_CONSOLE',
      action: 'PR_CREATED',
      entityType: 'PULL_REQUEST',
      entityId: pr.id,
      newState: {
        id: pr.id,
        title: pr.title,
        status: pr.status,
        requiredApprovals: pr.requiredApprovals,
      },
    });

    logger.info({ prId: pr.id, organizationId, createdBy: currentUserId }, 'Pull Request Created');
    return this.getPullRequestById(organizationId, pr.id);
  }

  async getPullRequestById(organizationId: string, prId: string, currentUserId?: string) {
    let pr = await this.prRepository.findPullRequestById(organizationId, prId);
    if (!pr) {
      // Check if PR is shared with active organization
      const { CollaborationRepository } = await import('../repositories/collaboration.repository');
      const collabRepo = new CollaborationRepository();
      const share = await collabRepo.findActiveShareForResource(
        'PULL_REQUEST' as any,
        prId,
        organizationId
      );

      if (share) {
        pr = await this.prRepository.findPullRequestById(share.ownerOrganizationId, prId);
        if (pr && currentUserId) {
          await collabRepo.recordAccess(
            share.id,
            currentUserId,
            share.permission as unknown as SharePermission
          );
        }
      }
    }

    if (!pr) {
      throw ApiError.notFound('Pull Request not found in current organization');
    }

    const approvalCount = this.calculateApprovalCount(pr.decisions);
    return {
      ...pr,
      approvalCount,
    };
  }

  async getPullRequests(organizationId: string, query: PRListQueryDto) {
    const result = await this.prRepository.findPullRequests(organizationId, query);
    const items = result.items.map((item) => ({
      ...item,
      approvalCount: this.calculateApprovalCount(item.decisions || []),
    }));

    return {
      ...result,
      items,
    };
  }

  async updatePullRequest(
    organizationId: string,
    prId: string,
    currentUserId: string,
    dto: UpdatePullRequestDto
  ) {
    const existing = await this.getPullRequestById(organizationId, prId);

    if (existing.status === PullRequestStatus.MERGED) {
      throw ApiError.badRequest('Cannot update a merged Pull Request');
    }

    const updateData: any = {};
    let contentChanged = false;

    if (dto.title !== undefined && dto.title !== existing.title) {
      updateData.title = dto.title;
      contentChanged = true;
    }
    if (dto.description !== undefined && dto.description !== existing.description) {
      updateData.description = dto.description;
      contentChanged = true;
    }
    if (dto.requiredApprovals !== undefined) {
      updateData.requiredApprovals = dto.requiredApprovals;
    }

    if (contentChanged) {
      const nextVersion = (existing.versions?.length || 0) + 1;
      await this.prRepository.createVersion({
        pullRequestId: prId,
        versionNumber: nextVersion,
        title: dto.title || existing.title,
        description: dto.description || existing.description,
        createdBy: currentUserId,
      });

      await this.prRepository.createActivity({
        pullRequestId: prId,
        actorId: currentUserId,
        action: 'VERSION_CREATED',
        metadata: `Version ${nextVersion}`,
      });

      // If changes were requested, revert status to UNDER_REVIEW upon new edit
      if (existing.status === PullRequestStatus.CHANGES_REQUESTED) {
        updateData.status = PullRequestStatus.UNDER_REVIEW;
      }
    }

    await this.prRepository.updatePullRequest(organizationId, prId, updateData);

    await this.prRepository.createActivity({
      pullRequestId: prId,
      actorId: currentUserId,
      action: 'PR_UPDATED',
    });

    return this.getPullRequestById(organizationId, prId);
  }

  async submitForReview(organizationId: string, prId: string, currentUserId: string) {
    const pr = await this.getPullRequestById(organizationId, prId);

    if (
      pr.status !== PullRequestStatus.DRAFT &&
      pr.status !== PullRequestStatus.CHANGES_REQUESTED
    ) {
      throw ApiError.badRequest(`Cannot submit PR for review from status '${pr.status}'`);
    }

    const nextStatus =
      (pr.reviewers?.length || 0) > 0
        ? PullRequestStatus.UNDER_REVIEW
        : PullRequestStatus.READY_FOR_REVIEW;

    await this.prRepository.updatePullRequest(organizationId, prId, { status: nextStatus });

    await this.prRepository.createActivity({
      pullRequestId: prId,
      actorId: currentUserId,
      action: 'SUBMITTED_FOR_REVIEW',
    });

    return this.getPullRequestById(organizationId, prId);
  }

  async addReviewer(
    organizationId: string,
    prId: string,
    currentUserId: string,
    reviewerId: string
  ) {
    const pr = await this.getPullRequestById(organizationId, prId);

    const existingReviewer = pr.reviewers?.find((r) => r.reviewerId === reviewerId);
    if (existingReviewer) {
      throw ApiError.conflict('Reviewer is already assigned to this Pull Request');
    }

    await this.prRepository.addReviewer(prId, reviewerId);

    // If status was READY_FOR_REVIEW, transition to UNDER_REVIEW
    if (pr.status === PullRequestStatus.READY_FOR_REVIEW) {
      await this.prRepository.updatePullRequest(organizationId, prId, {
        status: PullRequestStatus.UNDER_REVIEW,
      });
    }

    await this.prRepository.createActivity({
      pullRequestId: prId,
      actorId: currentUserId,
      action: 'REVIEWER_ASSIGNED',
      metadata: reviewerId,
    });

    return this.getPullRequestById(organizationId, prId);
  }

  async removeReviewer(
    organizationId: string,
    prId: string,
    currentUserId: string,
    reviewerId: string
  ) {
    await this.getPullRequestById(organizationId, prId);
    await this.prRepository.removeReviewer(prId, reviewerId);

    await this.prRepository.createActivity({
      pullRequestId: prId,
      actorId: currentUserId,
      action: 'REVIEWER_REMOVED',
      metadata: reviewerId,
    });

    return this.getPullRequestById(organizationId, prId);
  }

  async recordDecision(
    organizationId: string,
    prId: string,
    currentUserId: string,
    decision: ReviewDecisionType,
    comment?: string
  ) {
    const pr = await this.getPullRequestById(organizationId, prId);

    if (pr.status === PullRequestStatus.MERGED) {
      throw ApiError.badRequest('Cannot record review decision on a merged Pull Request');
    }

    // Record decision
    await this.prRepository.recordDecision({
      pullRequestId: prId,
      reviewerId: currentUserId,
      decision,
      comment,
    });

    // Record Activity
    await this.prRepository.createActivity({
      pullRequestId: prId,
      actorId: currentUserId,
      action: `DECISION_${decision}`,
      metadata: comment || decision,
    });

    // Fetch updated decisions for approval evaluation
    const updatedPr = await this.prRepository.findPullRequestById(organizationId, prId);
    if (!updatedPr) throw ApiError.notFound('Pull request missing');

    const approvalCount = this.calculateApprovalCount(updatedPr.decisions);

    let nextStatus: PullRequestStatus = updatedPr.status as unknown as PullRequestStatus;

    if (decision === ReviewDecisionType.REJECTED) {
      nextStatus = PullRequestStatus.REJECTED;
    } else if (decision === ReviewDecisionType.CHANGES_REQUESTED) {
      nextStatus = PullRequestStatus.CHANGES_REQUESTED;
    } else if (decision === ReviewDecisionType.APPROVED) {
      if (approvalCount >= updatedPr.requiredApprovals) {
        nextStatus = PullRequestStatus.APPROVED;
      }
    }

    if (nextStatus !== updatedPr.status) {
      await this.prRepository.updatePullRequest(organizationId, prId, { status: nextStatus });
    }

    if (pr.createdBy && pr.createdBy !== currentUserId) {
      const { notificationService } = await import('./notification.service');
      const { NotificationType } = await import('@workspace/shared-types');
      await notificationService.sendNotification({
        userId: pr.createdBy,
        organizationId,
        type:
          decision === ReviewDecisionType.APPROVED
            ? NotificationType.REVIEW_APPROVED
            : NotificationType.REVIEW_ASSIGNED,
        title: `🔀 PR Review Decision: ${decision}`,
        message: `Reviewer recorded ${decision} on your pull request "${pr.title}".`,
        referenceType: 'PULL_REQUEST',
        referenceId: prId,
      });
    }

    logger.info(
      { prId, reviewerId: currentUserId, decision, nextStatus },
      'Review Decision Recorded'
    );
    return this.getPullRequestById(organizationId, prId);
  }

  async mergePullRequest(organizationId: string, prId: string, currentUserId: string) {
    const pr = await this.getPullRequestById(organizationId, prId);

    if (pr.status === PullRequestStatus.MERGED) {
      throw ApiError.badRequest('Pull Request is already merged');
    }

    const approvalCount = pr.approvalCount || 0;
    if (pr.status !== PullRequestStatus.APPROVED && approvalCount < pr.requiredApprovals) {
      throw ApiError.badRequest(
        `Approval threshold not reached. Required ${pr.requiredApprovals} approval(s), but only ${approvalCount} received.`
      );
    }

    const merged = await this.prRepository.updatePullRequest(organizationId, prId, {
      status: PullRequestStatus.MERGED,
      mergedBy: currentUserId,
      mergedAt: new Date(),
    });

    await this.prRepository.createActivity({
      pullRequestId: prId,
      actorId: currentUserId,
      action: 'MERGED',
    });

    logger.info({ prId, organizationId, mergedBy: currentUserId }, 'Pull Request Merged');
    return merged;
  }

  async deletePullRequest(organizationId: string, prId: string, _currentUserId: string) {
    await this.getPullRequestById(organizationId, prId);
    await this.prRepository.deletePullRequest(organizationId, prId);
    return { success: true, message: 'Pull Request deleted successfully' };
  }

  async addComment(organizationId: string, prId: string, currentUserId: string, message: string) {
    await this.getPullRequestById(organizationId, prId);
    const comment = await this.prRepository.createComment(prId, currentUserId, message);

    await this.prRepository.createActivity({
      pullRequestId: prId,
      actorId: currentUserId,
      action: 'COMMENT_ADDED',
      metadata: message.length > 50 ? `${message.substring(0, 47)}...` : message,
    });

    return comment;
  }

  async updateComment(
    organizationId: string,
    commentId: string,
    currentUserId: string,
    message: string
  ) {
    const comment = await this.prRepository.findCommentById(commentId);
    if (!comment || comment.pullRequest.organizationId !== organizationId) {
      throw ApiError.notFound('Review comment not found');
    }

    if (comment.reviewerId !== currentUserId) {
      throw ApiError.forbidden('You can only edit your own comments');
    }

    return this.prRepository.updateComment(commentId, message);
  }

  async deleteComment(organizationId: string, commentId: string, currentUserId: string) {
    const comment = await this.prRepository.findCommentById(commentId);
    if (!comment || comment.pullRequest.organizationId !== organizationId) {
      throw ApiError.notFound('Review comment not found');
    }

    if (comment.reviewerId !== currentUserId) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    await this.prRepository.deleteComment(commentId);
    return { success: true, message: 'Comment deleted successfully' };
  }

  async getDashboardStats(organizationId: string, currentUserId: string) {
    return this.prRepository.getDashboardStats(organizationId, currentUserId);
  }
}
