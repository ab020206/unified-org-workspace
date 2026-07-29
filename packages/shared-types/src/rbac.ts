export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  REVIEWER = 'REVIEWER',
  GUEST = 'GUEST',
  AUDITOR = 'AUDITOR',
}

export enum Permission {
  // Organization Permissions
  ORG_READ = 'organization.read',
  ORG_CREATE = 'organization.create',
  ORG_UPDATE = 'organization.update',
  ORG_DELETE = 'organization.delete',
  ORG_INVITE = 'organization.invite',
  ORG_REMOVE_MEMBER = 'organization.remove_member',
  ORG_MANAGE_MEMBERS = 'organization.manage_members',

  // Ticket Permissions (Phase 3 Preparation)
  TICKET_READ = 'ticket.read',
  TICKET_CREATE = 'ticket.create',
  TICKET_UPDATE = 'ticket.update',
  TICKET_DELETE = 'ticket.delete',
  TICKET_ASSIGN = 'ticket.assign',

  // Review Permissions (Phase 4 Preparation)
  REVIEW_READ = 'review.read',
  REVIEW_CREATE = 'review.create',
  REVIEW_UPDATE = 'review.update',
  REVIEW_APPROVE = 'review.approve',
  REVIEW_REJECT = 'review.reject',
  REVIEW_MERGE = 'review.merge',

  // Audit & System Permissions
  AUDIT_READ = 'audit.read',
  SHARE_CREATE = 'share.create',
  SHARE_ACCEPT = 'share.accept',
  NOTIFICATION_READ = 'notification.read',
  NOTIFICATION_MANAGE = 'notification.manage',
  SYSTEM_ADMIN = 'system.admin',
}

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),

  [Role.ADMIN]: [
    Permission.ORG_READ,
    Permission.ORG_CREATE,
    Permission.ORG_UPDATE,
    Permission.ORG_DELETE,
    Permission.ORG_INVITE,
    Permission.ORG_REMOVE_MEMBER,
    Permission.ORG_MANAGE_MEMBERS,
    Permission.TICKET_READ,
    Permission.TICKET_CREATE,
    Permission.TICKET_UPDATE,
    Permission.TICKET_DELETE,
    Permission.TICKET_ASSIGN,
    Permission.REVIEW_READ,
    Permission.REVIEW_CREATE,
    Permission.REVIEW_UPDATE,
    Permission.REVIEW_APPROVE,
    Permission.REVIEW_REJECT,
    Permission.REVIEW_MERGE,
    Permission.AUDIT_READ,
    Permission.SHARE_CREATE,
    Permission.SHARE_ACCEPT,
    Permission.NOTIFICATION_READ,
    Permission.NOTIFICATION_MANAGE,
  ],

  [Role.SUPPORT_AGENT]: [
    Permission.ORG_READ,
    Permission.TICKET_READ,
    Permission.TICKET_CREATE,
    Permission.TICKET_UPDATE,
    Permission.TICKET_ASSIGN,
    Permission.REVIEW_READ,
    Permission.NOTIFICATION_READ,
    Permission.SHARE_ACCEPT,
  ],

  [Role.REVIEWER]: [
    Permission.ORG_READ,
    Permission.TICKET_READ,
    Permission.REVIEW_READ,
    Permission.REVIEW_CREATE,
    Permission.REVIEW_UPDATE,
    Permission.REVIEW_APPROVE,
    Permission.REVIEW_REJECT,
    Permission.NOTIFICATION_READ,
  ],

  [Role.GUEST]: [
    Permission.ORG_READ,
    Permission.TICKET_READ,
    Permission.REVIEW_READ,
    Permission.NOTIFICATION_READ,
  ],

  [Role.AUDITOR]: [
    Permission.ORG_READ,
    Permission.AUDIT_READ,
    Permission.NOTIFICATION_READ,
  ],
};

export interface UserRoleContext {
  userId: string;
  orgId: string;
  role: Role;
  permissions: Permission[];
}

export interface PermissionOverrideDto {
  id: string;
  memberId: string;
  permission: Permission;
  allowed: boolean;
}
