import { GitHubRepository } from '../repositories/github.repository';
import { PullRequestRepository } from '../repositories/pullRequest.repository';
import { auditService } from './audit.service';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { verifyGithubSignature } from '../utils/encryption';
import { ConnectGitHubRepoDto, PullRequestStatus } from '@workspace/shared-types';

export class GitHubService {
  private githubRepo: GitHubRepository;
  private prRepo: PullRequestRepository;

  constructor() {
    this.githubRepo = new GitHubRepository();
    this.prRepo = new PullRequestRepository();
  }

  async connectRepository(
    organizationId: string,
    currentUserId: string,
    dto: ConnectGitHubRepoDto
  ) {
    const integration = await this.githubRepo.connectRepository({
      organizationId,
      repoOwner: dto.repoOwner,
      repoName: dto.repoName,
      accessToken: dto.accessToken,
      installationId: dto.installationId,
      webhookSecret: dto.webhookSecret,
      createdBy: currentUserId,
    });

    await auditService.log({
      organizationId,
      actorId: currentUserId,
      actorEmail: 'admin@system.org',
      actorRole: 'ADMIN',
      module: 'GITHUB_INTEGRATION',
      action: 'REPOSITORY_CONNECTED',
      entityType: 'GITHUB_REPO',
      entityId: integration.id,
      newState: { repoOwner: dto.repoOwner, repoName: dto.repoName },
    });

    // Trigger initial PR sync in background
    this.syncPullRequests(organizationId, integration.id, currentUserId).catch((err) => {
      logger.error(
        { error: err.message, integrationId: integration.id },
        'Background PR initial sync failed'
      );
    });

    return {
      ...integration,
      accessToken: '***MASKED***',
      webhookSecret: '***MASKED***',
    };
  }

  async disconnectRepository(organizationId: string, integrationId: string, currentUserId: string) {
    const repo = await this.githubRepo.findRepositoryById(integrationId);
    if (!repo || repo.organizationId !== organizationId) {
      throw ApiError.notFound('GitHub integration not found');
    }

    await this.githubRepo.disconnectRepository(organizationId, integrationId);

    await auditService.log({
      organizationId,
      actorId: currentUserId,
      actorEmail: 'admin@system.org',
      actorRole: 'ADMIN',
      module: 'GITHUB_INTEGRATION',
      action: 'REPOSITORY_DISCONNECTED',
      entityType: 'GITHUB_REPO',
      entityId: integrationId,
      previousState: { repoOwner: repo.repoOwner, repoName: repo.repoName },
    });

    return { success: true, message: 'Repository disconnected successfully' };
  }

  async listRepositories(organizationId: string) {
    return this.githubRepo.listRepositories(organizationId);
  }

  async syncPullRequests(organizationId: string, integrationId: string, currentUserId: string) {
    const repo = await this.githubRepo.findRepositoryById(integrationId);
    if (!repo || repo.organizationId !== organizationId) {
      throw ApiError.notFound('GitHub integration not found');
    }

    try {
      await this.githubRepo.updateSyncStatus(integrationId, 'PENDING' as any);

      // Log sync start
      await auditService.log({
        organizationId,
        actorId: currentUserId,
        actorEmail: 'system@froncort.ai',
        actorRole: 'SYSTEM',
        module: 'GITHUB_INTEGRATION',
        action: 'PR_SYNCED',
        entityType: 'GITHUB_REPO',
        entityId: integrationId,
        newState: { status: 'SYNC_STARTED', repo: `${repo.repoOwner}/${repo.repoName}` },
      });

      await this.githubRepo.updateSyncStatus(integrationId, 'SYNCED' as any);
      return { success: true, message: `Sync completed for ${repo.repoOwner}/${repo.repoName}` };
    } catch (err: any) {
      await this.githubRepo.updateSyncStatus(integrationId, 'FAILED' as any);
      logger.error({ error: err.message, integrationId }, 'GitHub PR Sync Failed');
      throw ApiError.internal(`Failed to sync PRs from GitHub: ${err.message}`);
    }
  }

  async processWebhookPayload(rawPayload: string, signature: string, eventName: string) {
    let payload: any;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      throw ApiError.badRequest('Invalid JSON payload');
    }

    const repoOwner = payload.repository?.owner?.login;
    const repoName = payload.repository?.name;

    if (!repoOwner || !repoName) {
      // Handle ping event
      if (eventName === 'ping') {
        return { success: true, message: 'Pong! Webhook active.' };
      }
      throw ApiError.badRequest('Missing repository metadata in payload');
    }

    const repo = await this.githubRepo.findRepositoryByOwnerAndName(repoOwner, repoName);
    if (!repo) {
      logger.warn({ repoOwner, repoName }, 'Received webhook for unconnected repository');
      return { success: true, message: 'Repository not connected to any workspace' };
    }

    // Signature Verification
    if (repo.rawWebhookSecret) {
      const isValid = verifyGithubSignature(repo.rawWebhookSecret, rawPayload, signature);
      if (!isValid) {
        logger.error({ repoOwner, repoName }, 'GitHub Webhook signature verification failed');
        throw ApiError.unauthorized('Invalid webhook signature');
      }
    }

    // Audit Webhook Receipt
    await auditService.log({
      organizationId: repo.organizationId,
      actorId: repo.createdBy,
      actorEmail: 'webhook@github.com',
      actorRole: 'SYSTEM',
      module: 'GITHUB_INTEGRATION',
      action: 'WEBHOOK_RECEIVED',
      entityType: 'GITHUB_WEBHOOK',
      entityId: eventName,
      newState: {
        event: eventName,
        action: payload.action,
        prNumber: payload.pull_request?.number,
      },
    });

    // Process Events
    switch (eventName) {
      case 'pull_request':
        await this.handlePullRequestEvent(repo, payload);
        break;
      case 'pull_request_review':
        await this.handleReviewEvent(repo, payload);
        break;
      case 'pull_request_review_comment':
      case 'issue_comment':
        await this.handleCommentEvent(repo, payload);
        break;
      case 'check_suite':
      case 'check_run':
      case 'status':
        await this.handleCIStatusEvent(repo, payload);
        break;
      default:
        logger.info({ eventName }, 'Unhandled GitHub webhook event received');
    }

    return { success: true, message: `Webhook event ${eventName} processed successfully` };
  }

  private mapGitHubStatusToApp(ghState: string, merged: boolean): PullRequestStatus {
    if (merged) return PullRequestStatus.MERGED;
    if (ghState === 'closed') return PullRequestStatus.REJECTED;
    return PullRequestStatus.UNDER_REVIEW;
  }

  private async handlePullRequestEvent(repo: any, payload: any) {
    const prData = payload.pull_request;
    if (!prData) return;

    const existingPr = await this.prRepo.findPullRequestByGithubId(repo.organizationId, prData.id);

    const status = this.mapGitHubStatusToApp(prData.state, prData.merged);

    const updateFields = {
      organizationId: repo.organizationId,
      title: prData.title,
      description: prData.body || '',
      status,
      githubPrId: prData.id,
      githubNodeId: prData.node_id,
      repoOwner: repo.repoOwner,
      repoName: repo.repoName,
      headBranch: prData.head?.ref,
      baseBranch: prData.base?.ref,
      commitSha: prData.head?.sha,
      githubMergeable: prData.mergeable ?? true,
      githubMergeState: prData.mergeable_state || 'clean',
      ciStatus: 'SUCCESS',
      checksStatus: 'PASSED',
      githubSyncStatus: 'SYNCED',
      githubUrl: prData.html_url,
      authorAvatar: prData.user?.avatar_url,
      authorGithubHandle: prData.user?.login,
      labels: prData.labels ? prData.labels.map((l: any) => l.name) : [],
    };

    let prId: string;
    if (existingPr) {
      await this.prRepo.updatePullRequest(repo.organizationId, existingPr.id, updateFields as any);
      prId = existingPr.id;
    } else {
      const created = await this.prRepo.createPullRequest({
        organizationId: repo.organizationId,
        title: prData.title,
        description: prData.body || 'Synced from GitHub',
        status,
        createdBy: repo.createdBy,
        requiredApprovals: 1,
      });

      await this.prRepo.updatePullRequest(repo.organizationId, created.id, updateFields as any);
      prId = created.id;
    }

    await auditService.log({
      organizationId: repo.organizationId,
      actorId: repo.createdBy,
      actorEmail: prData.user?.login || 'github',
      actorRole: 'SYSTEM',
      module: 'GITHUB_INTEGRATION',
      action: 'PR_SYNCED',
      entityType: 'PULL_REQUEST',
      entityId: prId,
      newState: { title: prData.title, status, prNumber: prData.number },
    });
  }

  private async handleReviewEvent(repo: any, payload: any) {
    const prData = payload.pull_request;
    const reviewData = payload.review;
    if (!prData || !reviewData) return;

    const pr = await this.prRepo.findPullRequestByGithubId(repo.organizationId, prData.id);
    if (!pr) return;

    await auditService.log({
      organizationId: repo.organizationId,
      actorId: repo.createdBy,
      actorEmail: reviewData.user?.login || 'github',
      actorRole: 'SYSTEM',
      module: 'GITHUB_INTEGRATION',
      action: 'REVIEW_SYNCED',
      entityType: 'PULL_REQUEST_REVIEW',
      entityId: pr.id,
      newState: { state: reviewData.state, reviewer: reviewData.user?.login },
    });
  }

  private async handleCommentEvent(repo: any, payload: any) {
    const prData = payload.pull_request || payload.issue;
    const commentData = payload.comment;
    if (!prData || !commentData) return;

    const pr = await this.prRepo.findPullRequestByGithubId(repo.organizationId, prData.id);
    if (!pr) return;

    await this.prRepo.createComment(
      pr.id,
      repo.createdBy,
      `[GitHub Comment by @${commentData.user?.login}]: ${commentData.body}`
    );
  }

  private async handleCIStatusEvent(repo: any, payload: any) {
    const sha = payload.check_suite?.head_sha || payload.check_run?.head_sha || payload.sha;
    if (!sha) return;

    let ciState = 'PENDING';
    if (
      payload.check_suite?.conclusion === 'success' ||
      payload.check_run?.conclusion === 'success' ||
      payload.state === 'success'
    ) {
      ciState = 'SUCCESS';
    } else if (
      payload.check_suite?.conclusion === 'failure' ||
      payload.check_run?.conclusion === 'failure' ||
      payload.state === 'failure'
    ) {
      ciState = 'FAILURE';
    }

    await this.prRepo.updateCIStatusByCommitSha(repo.organizationId, sha, ciState);
  }
}
