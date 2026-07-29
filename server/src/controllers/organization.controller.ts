import { Request, Response } from 'express';
import { AppRequest } from '../types/index';
import { OrganizationService } from '../services/organization.service';
import { createSuccessResponse } from '@workspace/shared-utils';

export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService = new OrganizationService()
  ) {}

  public create = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) throw new Error('User missing');

    const org = await this.organizationService.createOrganization(appReq.user.id, req.body);
    res
      .status(201)
      .json(
        createSuccessResponse(org, 'Organization created successfully', appReq.requestId || 'N/A')
      );
  };

  public onboard = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) throw new Error('User missing');

    const result = await this.organizationService.onboardOrganization(appReq.user.id, req.body);
    res
      .status(201)
      .json(
        createSuccessResponse(
          result,
          'Organization and administrator onboarded successfully',
          appReq.requestId || 'N/A'
        )
      );
  };

  public list = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) throw new Error('User missing');

    const orgs = await this.organizationService.getUserOrganizations(appReq.user.id);
    res
      .status(200)
      .json(createSuccessResponse(orgs, 'User organizations retrieved', appReq.requestId || 'N/A'));
  };

  public getCurrent = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.organization) throw new Error('Active organization context missing');

    res
      .status(200)
      .json(
        createSuccessResponse(
          appReq.organization,
          'Current organization context retrieved',
          appReq.requestId || 'N/A'
        )
      );
  };

  public switch = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) throw new Error('User missing');

    const org = await this.organizationService.getOrganizationDetails(
      req.body.organizationId,
      appReq.user.id
    );

    res
      .status(200)
      .json(
        createSuccessResponse(
          org,
          'Switched active organization context',
          appReq.requestId || 'N/A'
        )
      );
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) throw new Error('User missing');
    const orgId = req.params.id || appReq.organization?.id;
    if (!orgId) throw new Error('Organization ID missing');

    const org = await this.organizationService.updateOrganization(orgId, appReq.user.id, req.body);
    res
      .status(200)
      .json(
        createSuccessResponse(org, 'Organization updated successfully', appReq.requestId || 'N/A')
      );
  };

  public invite = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');

    const invitation = await this.organizationService.inviteMember(
      appReq.organization.id,
      appReq.user.id,
      req.body,
      appReq.permissions
    );

    res
      .status(201)
      .json(
        createSuccessResponse(invitation, 'Invitation sent successfully', appReq.requestId || 'N/A')
      );
  };

  public accept = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user) throw new Error('User missing');

    const org = await this.organizationService.acceptInvitation(appReq.user.id, req.body.token);
    res
      .status(200)
      .json(
        createSuccessResponse(org, 'Invitation accepted successfully', appReq.requestId || 'N/A')
      );
  };

  public getMembers = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');

    const members = await this.organizationService.listMembers(
      appReq.organization.id,
      appReq.user.id
    );

    res
      .status(200)
      .json(
        createSuccessResponse(
          members,
          'Organization members listed successfully',
          appReq.requestId || 'N/A'
        )
      );
  };

  public createMemberDirect = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');

    const result = await this.organizationService.createMemberDirect(
      appReq.organization.id,
      appReq.user.id,
      req.body
    );

    res
      .status(201)
      .json(
        createSuccessResponse(result, 'Member created successfully', appReq.requestId || 'N/A')
      );
  };

  public updateMember = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');
    const { memberId } = req.params;

    const result = await this.organizationService.updateMember(
      appReq.organization.id,
      appReq.user.id,
      memberId,
      req.body
    );

    res
      .status(200)
      .json(
        createSuccessResponse(result, 'Member updated successfully', appReq.requestId || 'N/A')
      );
  };

  public removeMember = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');
    const { memberId } = req.params;

    await this.organizationService.removeMember(appReq.organization.id, appReq.user.id, memberId);

    res
      .status(200)
      .json(createSuccessResponse(null, 'Member removed successfully', appReq.requestId || 'N/A'));
  };

  public resetMemberPassword = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');
    const { memberId } = req.params;

    const result = await this.organizationService.resetMemberPassword(
      appReq.organization.id,
      appReq.user.id,
      memberId
    );

    res
      .status(200)
      .json(
        createSuccessResponse(
          result,
          'Member password reset successfully',
          appReq.requestId || 'N/A'
        )
      );
  };

  public listInvitations = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');

    const invitations = await this.organizationService.listInvitations(appReq.organization.id);

    res
      .status(200)
      .json(
        createSuccessResponse(
          invitations,
          'Invitations listed successfully',
          appReq.requestId || 'N/A'
        )
      );
  };

  public resendInvitation = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');
    const { invitationId } = req.params;

    const invitation = await this.organizationService.resendInvitation(
      appReq.organization.id,
      appReq.user.id,
      invitationId
    );

    res
      .status(200)
      .json(
        createSuccessResponse(
          invitation,
          'Invitation resent successfully',
          appReq.requestId || 'N/A'
        )
      );
  };

  public cancelInvitation = async (req: Request, res: Response): Promise<void> => {
    const appReq = req as AppRequest;
    if (!appReq.user || !appReq.organization) throw new Error('Context missing');
    const { invitationId } = req.params;

    await this.organizationService.cancelInvitation(
      appReq.organization.id,
      appReq.user.id,
      invitationId
    );

    res
      .status(200)
      .json(
        createSuccessResponse(null, 'Invitation cancelled successfully', appReq.requestId || 'N/A')
      );
  };
}
