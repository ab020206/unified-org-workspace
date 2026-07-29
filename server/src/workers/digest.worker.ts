import { digestQueue, DigestJobData } from '../queues/digest.queue';
import { DigestRepository } from '../repositories/digest.repository';
import { NotificationRepository } from '../repositories/notification.repository';
import { UserRepository } from '../repositories/user.repository';
import { OrganizationRepository } from '../repositories/organization.repository';
import { TicketRepository } from '../repositories/ticket.repository';
import { PullRequestRepository } from '../repositories/pullRequest.repository';
import { CollaborationRepository } from '../repositories/collaboration.repository';
import { aiService } from '../ai/ai.service';
import { PromptManager } from '../ai/prompt.manager';
import { DigestStatus, NotificationType } from '@workspace/shared-types';
import { logger } from '../utils/logger';

const digestRepo = new DigestRepository();
const notifRepo = new NotificationRepository();
const userRepo = new UserRepository();
const orgRepo = new OrganizationRepository();
const ticketRepo = new TicketRepository();
const prRepo = new PullRequestRepository();
const collabRepo = new CollaborationRepository();

export async function processDigestJob(job: DigestJobData) {
  const { userId, organizationId, digestId } = job;
  logger.info({ userId, organizationId }, 'Processing Digest Worker Job...');

  try {
    // 1. Fetch user & organization details
    const [user, org] = await Promise.all([
      userRepo.findById(userId),
      orgRepo.findById(organizationId),
    ]);

    if (!user || !org) {
      throw new Error(
        `User or Organization not found for digest (User: ${userId}, Org: ${organizationId})`
      );
    }

    // 2. Fetch personalized user activity
    const [tickets, prs, shares] = await Promise.all([
      ticketRepo.findTickets(organizationId, { limit: 100 }),
      prRepo.findPullRequests(organizationId, { limit: 100 }),
      collabRepo.listShares(organizationId),
    ]);

    const assignedTickets = tickets.items
      .filter((t) => t.assignedTo === userId || t.createdBy === userId)
      .map((t) => ({ id: t.id, title: t.title, priority: t.priority, status: t.status }));

    const pendingReviews = prs.items
      .filter((p) => p.status === 'UNDER_REVIEW' || p.createdBy === userId)
      .map((p) => ({ id: p.id, title: p.title, status: p.status }));

    const sharedResources = shares.incomingShares.map((s: any) => ({
      resourceType: s.resourceType,
      title: s.resourceDetails?.title,
    }));

    // 3. Build Prompt & Invoke AI Service
    const prompt = PromptManager.buildDigestPrompt({
      userName: `${user.firstName} ${user.lastName}`,
      orgName: org.name,
      assignedTickets,
      pendingReviews,
      sharedResources,
    });

    const completion = await aiService.generateCompletion(prompt);

    // 4. Save/Update Digest
    let targetDigestId = digestId;
    if (targetDigestId) {
      await digestRepo.updateDigestStatus(
        targetDigestId,
        DigestStatus.READY,
        completion.text,
        completion.tokenUsage
      );
    } else {
      const created = await digestRepo.createDigest({
        organizationId,
        userId,
        title: `AI Activity Briefing for ${user.firstName}`,
        summary: completion.text,
        status: DigestStatus.READY,
        modelUsed: completion.model,
        tokenUsage: completion.tokenUsage,
      });
      targetDigestId = created.id;
    }

    // 5. Create Notification
    await notifRepo.createNotification({
      userId,
      organizationId,
      type: NotificationType.AI_DIGEST,
      title: '✨ Your AI Activity Digest is Ready',
      message: `Your latest personalized activity briefing for ${org.name} has been generated.`,
      referenceType: 'DIGEST',
      referenceId: targetDigestId,
    });

    // 6. Log Job History
    await digestRepo.logJobHistory({
      queue: 'digest-queue',
      jobType: 'GENERATE_DIGEST',
      status: 'COMPLETED',
    });

    logger.info(
      { userId, organizationId, digestId: targetDigestId },
      'Digest Worker Job Completed Successfully'
    );
  } catch (err: any) {
    logger.error({ error: err.message, userId, organizationId }, 'Digest Worker Job Failed');
    if (digestId) {
      await digestRepo.updateDigestStatus(digestId, DigestStatus.FAILED);
    }
    await digestRepo.logJobHistory({
      queue: 'digest-queue',
      jobType: 'GENERATE_DIGEST',
      status: 'FAILED',
      errorMessage: err.message,
    });
  }
}

// Register processor with queue
digestQueue.setProcessor(processDigestJob);
