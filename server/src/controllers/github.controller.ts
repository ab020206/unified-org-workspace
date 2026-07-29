import { RequestHandler } from 'express';
import { AppRequest } from '../types/index';
import { GitHubService } from '../services/github.service';
import { ApiError } from '../utils/apiError';
import { createSuccessResponse } from '@workspace/shared-utils';

const githubService = new GitHubService();

export const connectRepository: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.organization || !appReq.user) {
    return next(ApiError.unauthorized('Organization or user context missing'));
  }

  try {
    const integration = await githubService.connectRepository(
      appReq.organization.id,
      appReq.user.id,
      req.body
    );
    res
      .status(201)
      .json(createSuccessResponse(integration, 'GitHub repository connected successfully'));
  } catch (err) {
    next(err);
  }
};

export const disconnectRepository: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.organization || !appReq.user) {
    return next(ApiError.unauthorized('Organization context missing'));
  }

  try {
    const { id } = req.params;
    const result = await githubService.disconnectRepository(
      appReq.organization.id,
      id,
      appReq.user.id
    );
    res.json(createSuccessResponse(result, 'Repository disconnected'));
  } catch (err) {
    next(err);
  }
};

export const listRepositories: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.organization) {
    return next(ApiError.unauthorized('Organization context missing'));
  }

  try {
    const repos = await githubService.listRepositories(appReq.organization.id);
    res.json(createSuccessResponse(repos));
  } catch (err) {
    next(err);
  }
};

export const syncPullRequests: RequestHandler = async (req, res, next) => {
  const appReq = req as AppRequest;
  if (!appReq.organization || !appReq.user) {
    return next(ApiError.unauthorized('Organization context missing'));
  }

  try {
    const { id } = req.params;
    const result = await githubService.syncPullRequests(appReq.organization.id, id, appReq.user.id);
    res.json(createSuccessResponse(result));
  } catch (err) {
    next(err);
  }
};

export const handleWebhook: RequestHandler = async (req, res, next) => {
  try {
    const signature = (req.headers['x-hub-signature-256'] as string) || '';
    const eventName = (req.headers['x-github-event'] as string) || 'ping';
    const rawPayload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const result = await githubService.processWebhookPayload(rawPayload, signature, eventName);
    res.json(createSuccessResponse(result));
  } catch (err) {
    next(err);
  }
};
