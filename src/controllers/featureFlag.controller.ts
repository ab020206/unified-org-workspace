import { Request, Response } from 'express';
import { AppRequest } from '../types/index';
import { featureFlagService } from '../services/featureFlag.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import { FeatureFlagToggleRequest } from '@workspace/shared-types';

export class FeatureFlagController {
  public getFeatureFlags = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const orgId = appReq.organization?.id;

    const result = await featureFlagService.getFeatureFlags(orgId);
    res.json(
      createSuccessResponse(
        result,
        'Feature flags retrieved successfully',
        appReq.requestId || 'N/A'
      )
    );
  };

  public toggleFeatureFlag = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const key = req.params.key;
    const { enabled, organizationId } = req.body as FeatureFlagToggleRequest;

    const targetOrgId = organizationId !== undefined ? organizationId : appReq.organization?.id;

    const actorContext = appReq.user
      ? {
          actorId: appReq.user.id,
          actorEmail: appReq.user.email,
          actorRole: appReq.membership?.role || 'ADMIN',
        }
      : undefined;

    const updated = await featureFlagService.toggleFlag(key, enabled, targetOrgId, actorContext);

    res.json(
      createSuccessResponse(
        updated,
        `Feature flag '${key}' updated successfully`,
        appReq.requestId || 'N/A'
      )
    );
  };
}
