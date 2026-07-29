import { Response } from 'express';
import { AppRequest } from '../types/index';
import { DigestService } from '../services/digest.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import { digestHistoryQuerySchema } from '../validators/digest.validator';

const digestService = new DigestService();

export class DigestController {
  static getLatestDigest = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;

    const digest = await digestService.getLatestDigest(orgId, userId);
    res
      .status(200)
      .json(createSuccessResponse(digest, 'Latest AI digest retrieved', req.requestId || 'N/A'));
  };

  static triggerGenerate = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;

    const pending = await digestService.triggerManualDigestGeneration(orgId, userId);
    res
      .status(202)
      .json(createSuccessResponse(pending, 'Digest generation enqueued', req.requestId || 'N/A'));
  };

  static getHistory = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { page, limit } = digestHistoryQuerySchema.parse(req.query);

    const history = await digestService.getDigestHistory(orgId, userId, page, limit);
    res
      .status(200)
      .json(createSuccessResponse(history, 'Digest history retrieved', req.requestId || 'N/A'));
  };
}
