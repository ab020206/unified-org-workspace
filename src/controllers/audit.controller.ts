import { Response } from 'express';
import { AppRequest } from '../types/index';
import { auditService } from '../services/audit.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import { auditListQuerySchema } from '../validators/audit.validator';
import { Role } from '@workspace/shared-types';

export class AuditController {
  static getAuditLogs = async (req: AppRequest, res: Response) => {
    const query = auditListQuerySchema.parse(req.query);
    const orgId = req.organization?.id || null;
    const isSuperAdmin = req.membership?.role === Role.SUPER_ADMIN;

    const result = await auditService.getLogs(query, orgId, isSuperAdmin);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Audit logs retrieved successfully', req.requestId || 'N/A')
      );
  };

  static getDashboardStats = async (req: AppRequest, res: Response) => {
    const orgId = req.organization?.id || null;
    const isSuperAdmin = req.membership?.role === Role.SUPER_ADMIN;

    const stats = await auditService.getDashboardStats(orgId, isSuperAdmin);
    res
      .status(200)
      .json(
        createSuccessResponse(
          stats,
          'Audit dashboard stats retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getDistinctModules = async (req: AppRequest, res: Response) => {
    const orgId = req.organization?.id || null;
    const isSuperAdmin = req.membership?.role === Role.SUPER_ADMIN;

    const modules = await auditService.getModules(orgId, isSuperAdmin);
    res
      .status(200)
      .json(
        createSuccessResponse(
          modules,
          'Audit modules retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getDistinctActions = async (req: AppRequest, res: Response) => {
    const orgId = req.organization?.id || null;
    const isSuperAdmin = req.membership?.role === Role.SUPER_ADMIN;

    const actions = await auditService.getActions(orgId, isSuperAdmin);
    res
      .status(200)
      .json(
        createSuccessResponse(
          actions,
          'Audit actions retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getAuditLogById = async (req: AppRequest, res: Response) => {
    const { id } = req.params;
    const orgId = req.organization?.id || null;
    const isSuperAdmin = req.membership?.role === Role.SUPER_ADMIN;

    const log = await auditService.getLogById(id, orgId, isSuperAdmin);
    if (!log) {
      res.status(404).json({
        success: false,
        message: 'Audit record not found',
        data: null,
      });
      return;
    }

    res
      .status(200)
      .json(
        createSuccessResponse(log, 'Audit record retrieved successfully', req.requestId || 'N/A')
      );
  };
}
