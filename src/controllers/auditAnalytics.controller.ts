import { RequestHandler } from 'express';
import { AppRequest } from '../types/index';
import { auditAnalyticsService } from '../services/auditAnalytics.service';
import { aiInsightsService } from '../services/aiInsights.service';
import { ApiError } from '../utils/apiError';
import { createSuccessResponse } from '@workspace/shared-utils';

import { Role } from '@workspace/shared-types';

export const getAnalytics: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.membership || !appReq.user) {
    return next(ApiError.unauthorized('User context missing'));
  }

  try {
    const isSuperAdmin = appReq.membership.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : appReq.organization?.id || null;

    const summary = await auditAnalyticsService.getAnalyticsSummary(
      req.query as any,
      scopedOrgId,
      appReq.membership.role
    );

    res.json(createSuccessResponse(summary, 'Audit analytics retrieved successfully'));
  } catch (err) {
    next(err);
  }
};

export const getAnomalies: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.membership || !appReq.user) {
    return next(ApiError.unauthorized('User context missing'));
  }

  try {
    const isSuperAdmin = appReq.membership.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : appReq.organization?.id || null;

    const alerts = await auditAnalyticsService.runAnomalyDetection(scopedOrgId);
    res.json(createSuccessResponse(alerts, 'Anomaly alerts retrieved'));
  } catch (err) {
    next(err);
  }
};

export const acknowledgeAnomaly: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.membership || !appReq.user) {
    return next(ApiError.unauthorized('User context missing'));
  }

  try {
    const { id } = req.params;
    const isSuperAdmin = appReq.membership.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : appReq.organization?.id || null;

    const updated = await auditAnalyticsService.acknowledgeAnomaly(id, appReq.user.id, scopedOrgId);

    res.json(createSuccessResponse(updated, 'Anomaly alert acknowledged'));
  } catch (err) {
    next(err);
  }
};

export const getAIInsights: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.membership || !appReq.user) {
    return next(ApiError.unauthorized('User context missing'));
  }

  try {
    const isSuperAdmin = appReq.membership.role === Role.SUPER_ADMIN;
    const scopedOrgId = isSuperAdmin ? null : appReq.organization?.id || null;

    const insights = await aiInsightsService.generateExecutiveInsights(
      scopedOrgId,
      appReq.membership.role
    );

    res.json(createSuccessResponse(insights, 'AI executive insights generated'));
  } catch (err) {
    next(err);
  }
};
