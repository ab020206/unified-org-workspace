import { Response } from 'express';
import { AppRequest } from '../types/index';
import { CollaborationService } from '../services/collaboration.service';
import { createSuccessResponse } from '@workspace/shared-utils';
import {
  createConnectionSchema,
  createShareSchema,
  updateShareSchema,
} from '../validators/collaboration.validator';
import { SharedResourceType } from '@workspace/shared-types';

const collabService = new CollaborationService();

export class CollaborationController {
  static requestConnection = async (req: AppRequest, res: Response) => {
    const sourceOrgId = req.organization!.id;
    const userId = req.user!.id;
    const { targetOrganizationIdOrSlug } = createConnectionSchema.parse(req.body);

    const connection = await collabService.requestConnection(
      sourceOrgId,
      userId,
      targetOrganizationIdOrSlug
    );
    res
      .status(201)
      .json(
        createSuccessResponse(
          connection,
          'Connection request sent successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getConnections = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;

    const connections = await collabService.listConnections(orgId);
    res
      .status(200)
      .json(
        createSuccessResponse(
          connections,
          'Connections retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static acceptConnection = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const updated = await collabService.acceptConnection(id, orgId, userId);
    res
      .status(200)
      .json(createSuccessResponse(updated, 'Connection request accepted', req.requestId || 'N/A'));
  };

  static rejectConnection = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const updated = await collabService.rejectConnection(id, orgId, userId);
    res
      .status(200)
      .json(createSuccessResponse(updated, 'Connection request rejected', req.requestId || 'N/A'));
  };

  static disconnect = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await collabService.disconnect(id, orgId, userId);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Connection revoked successfully', req.requestId || 'N/A')
      );
  };

  static createShare = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const validated = createShareSchema.parse(req.body);

    const share = await collabService.shareResource(orgId, userId, validated as any);
    res
      .status(201)
      .json(createSuccessResponse(share, 'Resource shared successfully', req.requestId || 'N/A'));
  };

  static getDashboard = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;

    const dashboard = await collabService.getSharedDashboard(orgId);
    res
      .status(200)
      .json(
        createSuccessResponse(
          dashboard,
          'Shared dashboard retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static updateShare = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;
    const validated = updateShareSchema.parse(req.body);

    const updated = await collabService.updateShare(orgId, userId, id, validated);
    res
      .status(200)
      .json(
        createSuccessResponse(
          updated,
          'Resource share updated successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static revokeShare = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await collabService.revokeShare(orgId, userId, id);
    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Resource share revoked successfully', req.requestId || 'N/A')
      );
  };

  static getSharedTickets = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const dashboard = await collabService.getSharedDashboard(orgId);
    const sharedTickets = dashboard.incomingShares.filter(
      (s) => s.resourceType === SharedResourceType.TICKET
    );
    res
      .status(200)
      .json(
        createSuccessResponse(
          sharedTickets,
          'Shared tickets retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };

  static getSharedPullRequests = async (req: AppRequest, res: Response) => {
    const orgId = req.organization!.id;
    const dashboard = await collabService.getSharedDashboard(orgId);
    const sharedPRs = dashboard.incomingShares.filter(
      (s) => s.resourceType === SharedResourceType.PULL_REQUEST
    );
    res
      .status(200)
      .json(
        createSuccessResponse(
          sharedPRs,
          'Shared pull requests retrieved successfully',
          req.requestId || 'N/A'
        )
      );
  };
}
