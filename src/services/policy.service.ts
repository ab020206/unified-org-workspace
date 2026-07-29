import { Permission, Role } from '@workspace/shared-types';
import { PermissionService } from './permission.service';

export class PolicyService {
  constructor(private readonly permissionService: PermissionService = new PermissionService()) {}

  public canInviteMember(permissions: Permission[]): boolean {
    return permissions.includes(Permission.ORG_INVITE);
  }

  public canManageMembers(permissions: Permission[]): boolean {
    return permissions.includes(Permission.ORG_MANAGE_MEMBERS);
  }

  public canDeleteOrganization(permissions: Permission[], role: Role): boolean {
    return (
      role === Role.SUPER_ADMIN ||
      (role === Role.ADMIN && permissions.includes(Permission.ORG_DELETE))
    );
  }

  public canCreateTicket(permissions: Permission[]): boolean {
    return permissions.includes(Permission.TICKET_CREATE);
  }

  public canAssignTicket(permissions: Permission[]): boolean {
    return permissions.includes(Permission.TICKET_ASSIGN);
  }

  public canApproveReview(permissions: Permission[]): boolean {
    return permissions.includes(Permission.REVIEW_APPROVE);
  }

  public canReadAuditLog(permissions: Permission[]): boolean {
    return permissions.includes(Permission.AUDIT_READ);
  }
}
