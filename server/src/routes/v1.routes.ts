import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import organizationRoutes from './organization.routes';
import { ticketRouter, commentRouter, attachmentRouter } from './ticket.routes';
import { pullRequestRouter, prCommentRouter } from './pullRequest.routes';
import { auditRouter } from './audit.routes';
import { connectionsRouter, sharingRouter, sharedFeedRouter } from './collaboration.routes';
import { digestRouter } from './digest.routes';
import { notificationRouter } from './notification.routes';
import featureFlagRoutes from './featureFlag.routes';
import securityRoutes from './security.routes';
import platformRoutes from './platform.routes';
import { requireFeature } from '../middleware/featureFlag.middleware';
import { authRateLimiter, aiRateLimiter } from '../middleware/rateLimiter';
import { FeatureFlagKey } from '@workspace/shared-types';

import githubRoutes from './github.routes';

const router = Router();

// Version 1 Routes Registration
router.use('/health', healthRoutes);
router.use('/auth', authRateLimiter, authRoutes);
router.use('/platform', platformRoutes);
router.use('/organizations', organizationRoutes);
router.use('/security', securityRoutes);
router.use('/feature-flags', featureFlagRoutes);
router.use('/github', githubRoutes);

// Tickets & Core Workspace
router.use('/tickets', ticketRouter);
router.use('/comments', commentRouter);
router.use('/attachments', attachmentRouter);

// Feature-gated Routes
router.use('/pull-requests', requireFeature(FeatureFlagKey.REVIEW_CONSOLE), pullRequestRouter);
router.use('/pr-comments', requireFeature(FeatureFlagKey.REVIEW_CONSOLE), prCommentRouter);

router.use('/audit', auditRouter);

router.use('/connections', requireFeature(FeatureFlagKey.CROSS_ORG_SHARING), connectionsRouter);
router.use('/sharing', requireFeature(FeatureFlagKey.CROSS_ORG_SHARING), sharingRouter);
router.use('/shared', requireFeature(FeatureFlagKey.CROSS_ORG_SHARING), sharedFeedRouter);

router.use('/digest', requireFeature(FeatureFlagKey.AI_DIGEST), aiRateLimiter, digestRouter);
router.use('/notifications', requireFeature(FeatureFlagKey.NOTIFICATIONS), notificationRouter);

export default router;
