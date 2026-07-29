import { RequestHandler } from 'express';
import { AppRequest } from '../types/index';
import { featureFlagService } from '../services/featureFlag.service';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { FeatureFlagKey } from '@workspace/shared-types';

export function requireFeature(flagKey: FeatureFlagKey | string): RequestHandler {
  return async (req, _res, next) => {
    const appReq = req as AppRequest;
    let orgId = appReq.organization?.id;

    if (!orgId) {
      orgId =
        (req.headers['x-organization-id'] as string | undefined) ||
        (req.query.organizationId as string | undefined);
    }

    try {
      const enabled = await featureFlagService.isEnabled(flagKey, orgId);
      if (!enabled) {
        logger.warn(
          { flagKey, orgId, userId: appReq.user?.id },
          'Feature Access Denied: Feature flag is disabled'
        );
        return next(
          new ApiError(
            403,
            `Feature '${flagKey}' is currently disabled for this workspace`,
            'FEATURE_DISABLED'
          )
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
