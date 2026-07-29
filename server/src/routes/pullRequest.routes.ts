import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate } from '../middleware/authenticate';
import { tenantContext } from '../middleware/tenantContext';
import { resolvePermissions, requirePermission } from '../middleware/authorize';
import { PullRequestController } from '../controllers/pullRequest.controller';
import { Permission } from '@workspace/shared-types';

export const pullRequestRouter = Router();

// Apply auth, tenant resolution, and permission resolution middleware
pullRequestRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

// Dashboard Stats
pullRequestRouter.get(
  '/stats',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.getDashboardStats)
);

// PR CRUD
pullRequestRouter.post(
  '/',
  requirePermission(Permission.REVIEW_CREATE),
  asyncHandler(PullRequestController.createPullRequest)
);

pullRequestRouter.get(
  '/',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.getPullRequests)
);

pullRequestRouter.get(
  '/:id',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.getPullRequestById)
);

pullRequestRouter.patch(
  '/:id',
  requirePermission(Permission.REVIEW_UPDATE),
  asyncHandler(PullRequestController.updatePullRequest)
);

pullRequestRouter.delete(
  '/:id',
  requirePermission(Permission.REVIEW_UPDATE),
  asyncHandler(PullRequestController.deletePullRequest)
);

// Workflow Actions
pullRequestRouter.patch(
  '/:id/submit',
  requirePermission(Permission.REVIEW_UPDATE),
  asyncHandler(PullRequestController.submitForReview)
);

pullRequestRouter.patch(
  '/:id/approve',
  requirePermission(Permission.REVIEW_APPROVE),
  asyncHandler(PullRequestController.approvePR)
);

pullRequestRouter.patch(
  '/:id/reject',
  requirePermission(Permission.REVIEW_REJECT),
  asyncHandler(PullRequestController.rejectPR)
);

pullRequestRouter.patch(
  '/:id/request-changes',
  requirePermission(Permission.REVIEW_REJECT),
  asyncHandler(PullRequestController.requestChanges)
);

pullRequestRouter.patch(
  '/:id/merge',
  requirePermission(Permission.REVIEW_MERGE),
  asyncHandler(PullRequestController.mergePR)
);

// Reviewers
pullRequestRouter.post(
  '/:id/reviewers',
  requirePermission(Permission.REVIEW_UPDATE),
  asyncHandler(PullRequestController.addReviewers)
);

pullRequestRouter.delete(
  '/:id/reviewers/:reviewerId',
  requirePermission(Permission.REVIEW_UPDATE),
  asyncHandler(PullRequestController.removeReviewer)
);

pullRequestRouter.get(
  '/:id/reviewers',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.getReviewers)
);

// Comments
pullRequestRouter.post(
  '/:id/comments',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.addComment)
);

pullRequestRouter.get(
  '/:id/comments',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.getComments)
);

// Versions & Activity Timeline
pullRequestRouter.get(
  '/:id/versions',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.getVersions)
);

pullRequestRouter.get(
  '/:id/activity',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.getActivityTimeline)
);

// Standalone router for review comments modification
export const prCommentRouter = Router();
prCommentRouter.use(authenticate, asyncHandler(tenantContext), asyncHandler(resolvePermissions));

prCommentRouter.patch(
  '/:id',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.updateComment)
);

prCommentRouter.delete(
  '/:id',
  requirePermission(Permission.REVIEW_READ),
  asyncHandler(PullRequestController.deleteComment)
);
