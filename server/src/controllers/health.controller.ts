import { Request, Response } from 'express';
import { AppRequest } from '../types/index';
import { HealthService } from '../services/health.service';
import { createSuccessResponse } from '@workspace/shared-utils';

export class HealthController {
  constructor(private readonly healthService: HealthService = new HealthService()) {}

  public getHealth = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const health = await this.healthService.getHealthStatus();
    const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;

    res
      .status(statusCode)
      .json(createSuccessResponse(health, 'Health check completed', appReq.requestId || 'N/A'));
  };

  public getLiveness = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const live = await this.healthService.checkLiveness();
    res.status(200).json(createSuccessResponse(live, 'System is live', appReq.requestId || 'N/A'));
  };

  public getReadiness = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    const readyState = await this.healthService.checkReadiness();
    const statusCode = readyState.ready ? 200 : 503;

    res
      .status(statusCode)
      .json(
        createSuccessResponse(
          readyState,
          readyState.ready ? 'System is ready' : 'System is not ready',
          appReq.requestId || 'N/A'
        )
      );
  };
}
