import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { OrganizationRepository } from '../repositories/organization.repository';
import { MemberRepository } from '../repositories/member.repository';
import { InvitationRepository } from '../repositories/invitation.repository';
import { UserRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OnboardOrganizationRequest,
  OnboardOrganizationResponse,
  CreateMemberDirectRequest,
  UpdateMemberRequest,
  CreateMemberResponse,
  InviteMemberRequest,
  OrganizationDto,
  OrganizationDetailsDto,
  OrganizationMemberDto,
  InvitationDto,
  Role,
  Permission,
} from '@workspace/shared-types';

import { generateAccessToken } from '../auth';
import { auditService } from './audit.service';

import { prisma } from '../config/prisma';

export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository = new OrganizationRepository(),
    private readonly memberRepository: MemberRepository = new MemberRepository(),
    private readonly invitationRepository: InvitationRepository = new InvitationRepository(),
    private readonly userRepository: UserRepository = new UserRepository()
  ) {}

  public formatOrg(org: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: { members: number } | null;
    memberCount?: number;
  }): OrganizationDto & { memberCount?: number } {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      createdBy: org.createdBy,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
      memberCount: org.memberCount ?? org._count?.members ?? 1,
    };
  }

  public async createOrganization(
    userId: string,
    data: CreateOrganizationRequest
  ): Promise<OrganizationDetailsDto> {
    const baseSlug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    let slug = baseSlug;

    const existingSlug = await this.organizationRepository.findBySlug(slug);
    if (existingSlug) {
      slug = `${baseSlug}-${randomUUID().slice(0, 6)}`;
    }

    const creator = await this.userRepository.findById(userId);
    if (!creator || !creator.isPlatformUser) {
      throw ApiError.forbidden('Only Platform Super Admins are authorized to create new organizations');
    }

    const org = await this.organizationRepository.create({
      name: data.name,
      slug,
      logo: data.logo,
      createdBy: userId,
    });

    logger.info({ userId, orgId: org.id }, 'Organization created by Platform Super Admin');

    await auditService.log({
      organizationId: org.id,
      actorId: userId,
      actorEmail: creator.email,
      actorRole: 'SUPER_ADMIN',
      module: 'ORGANIZATION',
      action: 'CREATE_ORGANIZATION',
      entityType: 'ORGANIZATION',
      entityId: org.id,
      newState: { id: org.id, name: org.name, slug: org.slug },
    });

    return {
      ...this.formatOrg(org),
      membersCount: 0,
      userRole: Role.SUPER_ADMIN,
    };
  }

  public async onboardOrganization(
    userId: string,
    data: OnboardOrganizationRequest
  ): Promise<OnboardOrganizationResponse> {
    const creator = await this.userRepository.findById(userId);
    if (!creator) {
      throw ApiError.notFound('Creator user not found');
    }

    // 1. Validate & Generate Slug
    const baseSlug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    let slug = baseSlug;

    const existingSlug = await this.organizationRepository.findBySlug(slug);
    if (existingSlug) {
      if (data.slug) {
        throw ApiError.conflict('An organization with this slug already exists');
      }
      slug = `${baseSlug}-${randomUUID().slice(0, 6)}`;
    }

    // 2. Create Organization
    const org = await this.organizationRepository.create({
      name: data.name,
      slug,
      logo: data.logo || null,
      createdBy: userId,
    });

    logger.info({ userId, orgId: org.id }, 'Organization onboarded');

    await auditService.log({
      organizationId: org.id,
      actorId: userId,
      actorEmail: creator.email,
      actorRole: creator.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
      module: 'ORGANIZATION',
      action: 'CREATE_ORGANIZATION',
      entityType: 'ORGANIZATION',
      entityId: org.id,
      newState: { id: org.id, name: org.name, slug: org.slug },
    });

    const authMode = data.authMode || 'DIRECT';
    let adminUser = await this.userRepository.findByEmail(data.adminEmail);
    let tempPassword: string | undefined;
    let invitationToken: string | undefined;

    if (authMode === 'DIRECT') {
      if (!adminUser) {
        tempPassword =
          data.adminPassword || `AdminPass!${Math.random().toString(36).substring(2, 8)}#2026`;
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        adminUser = await this.userRepository.create({
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          email: data.adminEmail,
          passwordHash,
          isActive: true,
          isPlatformUser: false,
        });
      }

      await this.memberRepository.addMember(org.id, adminUser.id, Role.ADMIN);

      await auditService.log({
        organizationId: org.id,
        actorId: userId,
        actorEmail: creator.email,
        actorRole: creator.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
        module: 'ORGANIZATION',
        action: 'CREATE_ORGANIZATION_ADMIN',
        entityType: 'USER',
        entityId: adminUser.id,
        newState: {
          organizationId: org.id,
          userId: adminUser.id,
          role: Role.ADMIN,
          email: adminUser.email,
        },
      });
    } else {
      const token = randomUUID();
      const invitation = await this.invitationRepository.createInvitation(
        org.id,
        data.adminEmail,
        userId,
        token,
        Role.ADMIN,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      invitationToken = invitation.token;

      if (!adminUser) {
        tempPassword = `InvitePass!${Math.random().toString(36).substring(2, 8)}#2026`;
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        adminUser = await this.userRepository.create({
          firstName: data.adminFirstName,
          lastName: data.adminLastName,
          email: data.adminEmail,
          passwordHash,
          isActive: true,
          isPlatformUser: false,
        });
      }

      await this.memberRepository.addMember(org.id, adminUser.id, Role.ADMIN);

      await auditService.log({
        organizationId: org.id,
        actorId: userId,
        actorEmail: creator.email,
        actorRole: creator.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
        module: 'ORGANIZATION',
        action: 'INVITE_MEMBER',
        entityType: 'INVITATION',
        entityId: invitation.id,
        newState: {
          organizationId: org.id,
          email: data.adminEmail,
          role: Role.ADMIN,
          token: invitation.token,
        },
      });
    }

    return {
      organization: this.formatOrg(org),
      administrator: {
        id: adminUser.id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: Role.ADMIN,
      },
      authMode,
      temporaryPassword: tempPassword,
      invitationToken,
      loginUrl: '/login',
    };
  }

  public async getUserOrganizations(userId: string): Promise<OrganizationDto[]> {
    const user = await this.userRepository.findById(userId);
    if (user?.isPlatformUser) {
      const allOrgs = await prisma.organization.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { members: true } } },
      });
      return allOrgs.map((org) => this.formatOrg(org));
    }
    const orgs = await this.organizationRepository.findUserOrganizations(userId);
    return orgs.map((org) => this.formatOrg(org));
  }

  public async getOrganizationsMe(
    userId: string,
    currentOrgId?: string
  ): Promise<{
    organizations: Array<
      OrganizationDto & {
        role: Role;
        status: string;
        joinedAt: string;
        isCurrent: boolean;
      }
    >;
    currentOrganization: OrganizationDetailsDto | null;
    isPlatformUser: boolean;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.isPlatformUser) {
      const allOrgs = await prisma.organization.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            where: { userId },
          },
          _count: { select: { members: true } },
        },
      });

      const organizations = allOrgs.map((org) => {
        const member = org.members[0];
        const role = member ? (member.role as Role) : Role.SUPER_ADMIN;
        const isCurrent = currentOrgId ? org.id === currentOrgId : false;
        return {
          ...this.formatOrg(org),
          role,
          status: 'ACTIVE',
          joinedAt: member ? member.joinedAt.toISOString() : org.createdAt.toISOString(),
          isCurrent,
        };
      });

      let currentOrganization: OrganizationDetailsDto | null = null;
      if (currentOrgId && currentOrgId !== 'platform') {
        try {
          currentOrganization = await this.getOrganizationDetails(currentOrgId, userId);
        } catch {
          currentOrganization = null;
        }
      }

      return {
        organizations,
        currentOrganization,
        isPlatformUser: true,
      };
    }

    const memberships = await prisma.organizationMember.findMany({
      where: { userId, isActive: true },
      include: {
        organization: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const activeId = currentOrgId || (memberships.length > 0 ? memberships[0].organizationId : undefined);

    const organizations = memberships.map((m) => {
      const isCurrent = Boolean(activeId && m.organizationId === activeId);
      return {
        ...this.formatOrg(m.organization),
        role: m.role as Role,
        status: m.isActive ? 'ACTIVE' : 'INACTIVE',
        joinedAt: m.joinedAt.toISOString(),
        isCurrent,
      };
    });

    let currentOrganization: OrganizationDetailsDto | null = null;
    if (activeId) {
      try {
        currentOrganization = await this.getOrganizationDetails(activeId, userId);
      } catch {
        currentOrganization = null;
      }
    }

    return {
      organizations,
      currentOrganization,
      isPlatformUser: false,
    };
  }

  public async switchOrganizationContext(
    userId: string,
    targetOrgId: string,
    previousOrgId?: string
  ): Promise<{
    activeOrganization: OrganizationDetailsDto | null;
    role: Role | null;
    token: string;
    isPlatformView: boolean;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Case 1: Switching to Platform View
    if (targetOrgId === 'platform') {
      if (!user.isPlatformUser) {
        await auditService.log({
          actorId: userId,
          actorEmail: user.email,
          actorRole: 'GUEST',
          module: 'ORGANIZATION',
          action: 'FAILED_SWITCH_ATTEMPT',
          entityType: 'ORGANIZATION',
          entityId: 'platform',
          newState: { reason: 'Non-platform user attempted to enter Platform View' },
        });
        throw ApiError.forbidden('Platform View is restricted to Platform Super Admins');
      }

      await auditService.log({
        actorId: userId,
        actorEmail: user.email,
        actorRole: 'SUPER_ADMIN',
        module: 'ORGANIZATION',
        action: 'PLATFORM_VIEW_ENTERED',
        entityType: 'ORGANIZATION',
        entityId: 'platform',
        previousState: previousOrgId ? { organizationId: previousOrgId } : null,
      });

      const token = generateAccessToken({
        sub: userId,
        userId: userId,
        email: user.email,
        role: Role.SUPER_ADMIN,
        activeOrgId: null,
      });

      return {
        activeOrganization: null,
        role: Role.SUPER_ADMIN,
        token,
        isPlatformView: true,
      };
    }

    // Case 2: Switching into an Organization
    const org = await this.organizationRepository.findById(targetOrgId);
    if (!org) {
      await auditService.log({
        actorId: userId,
        actorEmail: user.email,
        actorRole: user.isPlatformUser ? 'SUPER_ADMIN' : 'USER',
        module: 'ORGANIZATION',
        action: 'FAILED_SWITCH_ATTEMPT',
        entityType: 'ORGANIZATION',
        entityId: targetOrgId,
        newState: { reason: 'Target organization does not exist' },
      });
      throw ApiError.notFound('Target organization not found');
    }

    let roleInOrg: Role;

    if (user.isPlatformUser) {
      const membership = await this.memberRepository.findMembership(targetOrgId, userId);
      roleInOrg = membership?.isActive ? (membership.role as Role) : Role.SUPER_ADMIN;
    } else {
      const membership = await this.memberRepository.findMembership(targetOrgId, userId);
      if (!membership || !membership.isActive) {
        await auditService.log({
          actorId: userId,
          actorEmail: user.email,
          actorRole: 'USER',
          module: 'ORGANIZATION',
          action: 'FAILED_SWITCH_ATTEMPT',
          entityType: 'ORGANIZATION',
          entityId: targetOrgId,
          newState: { reason: 'User is not an active member of this organization' },
        });
        throw ApiError.forbidden('You are not an active member of this organization');
      }
      roleInOrg = membership.role as Role;
    }

    const orgDetails = await this.getOrganizationDetails(targetOrgId, userId);

    const action = previousOrgId === 'platform' ? 'PLATFORM_VIEW_EXITED' : 'ORGANIZATION_SWITCHED';

    await auditService.log({
      organizationId: targetOrgId,
      actorId: userId,
      actorEmail: user.email,
      actorRole: roleInOrg,
      module: 'ORGANIZATION',
      action,
      entityType: 'ORGANIZATION',
      entityId: targetOrgId,
      previousState: previousOrgId ? { organizationId: previousOrgId } : null,
      newState: { organizationId: targetOrgId, role: roleInOrg },
    });

    const token = generateAccessToken({
      sub: userId,
      userId: userId,
      email: user.email,
      role: roleInOrg,
      activeOrgId: targetOrgId,
    });

    return {
      activeOrganization: orgDetails,
      role: roleInOrg,
      token,
      isPlatformView: false,
    };
  }

  public async getOrganizationDetails(
    organizationId: string,
    userId: string
  ): Promise<OrganizationDetailsDto> {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    const membership = await this.memberRepository.findMembership(organizationId, userId);
    if (!membership || !membership.isActive) {
      const user = await this.userRepository.findById(userId);
      if (user?.isPlatformUser) {
        const membersCount = await this.memberRepository.countMembers(organizationId);
        return {
          ...this.formatOrg(org),
          membersCount,
          userRole: Role.ADMIN,
        };
      }
      throw ApiError.forbidden('You are not an active member of this organization');
    }

    const membersCount = await this.memberRepository.countMembers(organizationId);

    return {
      ...this.formatOrg(org),
      membersCount,
      userRole: membership.role as Role,
    };
  }

  public async updateOrganization(
    organizationId: string,
    userId: string,
    data: UpdateOrganizationRequest
  ): Promise<OrganizationDetailsDto> {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const membership = await this.memberRepository.findMembership(organizationId, userId);
    if (
      !user.isPlatformUser &&
      (!membership || !membership.isActive || membership.role !== Role.ADMIN)
    ) {
      throw ApiError.forbidden(
        'Only organization admins or platform super admins can update organization details'
      );
    }

    const slug = data.slug;
    if (slug && slug !== org.slug) {
      const existing = await this.organizationRepository.findBySlug(slug);
      if (existing && existing.id !== organizationId) {
        throw ApiError.conflict('An organization with this slug already exists');
      }
    }

    const updatedOrg = await this.organizationRepository.update(organizationId, {
      ...(data.name ? { name: data.name } : {}),
      ...(slug ? { slug } : {}),
      ...(data.logo !== undefined ? { logo: data.logo || null } : {}),
    });

    logger.info({ userId, orgId: organizationId }, 'Organization updated');

    await auditService.log({
      organizationId,
      actorId: userId,
      actorEmail: user.email,
      actorRole: user.isPlatformUser ? 'SUPER_ADMIN' : membership?.role || 'ADMIN',
      module: 'ORGANIZATION',
      action: 'UPDATE_ORGANIZATION',
      entityType: 'ORGANIZATION',
      entityId: organizationId,
      previousState: { name: org.name, slug: org.slug, logo: org.logo },
      newState: { name: updatedOrg.name, slug: updatedOrg.slug, logo: updatedOrg.logo },
    });

    return this.getOrganizationDetails(organizationId, userId);
  }

  public async inviteMember(
    organizationId: string,
    inviterId: string,
    data: InviteMemberRequest,
    permissions?: Permission[]
  ): Promise<InvitationDto> {
    const org = await this.organizationRepository.findById(organizationId);
    if (!org) {
      throw ApiError.notFound('Organization not found');
    }

    const inviter = await this.userRepository.findById(inviterId);
    if (!inviter) {
      throw ApiError.notFound('Inviter user not found');
    }

    const inviterMembership = await this.memberRepository.findMembership(organizationId, inviterId);
    if (!inviterMembership || !inviterMembership.isActive) {
      throw ApiError.forbidden('You are not an active member of this organization');
    }

    // Permission / Policy check
    if (permissions && !permissions.includes(Permission.ORG_INVITE)) {
      throw ApiError.forbidden('Insufficient permissions to invite new members');
    }

    // Check if recipient is already a member
    const recipient = await this.userRepository.findByEmail(data.email);
    if (recipient) {
      const recipientMember = await this.memberRepository.findMembership(
        organizationId,
        recipient.id
      );
      if (recipientMember && recipientMember.isActive) {
        throw ApiError.conflict('User is already a member of this organization');
      }
    }

    const token = randomUUID();
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const invitation = await this.invitationRepository.createInvitation(
      organizationId,
      data.email,
      inviterId,
      token,
      data.role as Role,
      expiry
    );

    logger.info({ organizationId, email: data.email, inviterId }, 'Organization invitation sent');

    await auditService.log({
      organizationId,
      actorId: inviterId,
      actorEmail: inviter.email,
      actorRole: inviterMembership.role,
      module: 'ORGANIZATION',
      action: 'INVITE_MEMBER',
      entityType: 'INVITATION',
      entityId: invitation.id,
      newState: { email: data.email, role: data.role },
    });

    return {
      id: invitation.id,
      organizationId: org.id,
      organizationName: org.name,
      email: invitation.email,
      invitedBy: inviter.id,
      invitedByName: `${inviter.firstName} ${inviter.lastName}`,
      role: invitation.role as Role,
      token: invitation.token,
      expiry: invitation.expiry.toISOString(),
      acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
    };
  }

  public async acceptInvitation(userId: string, token: string): Promise<OrganizationDetailsDto> {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation || invitation.expiry < new Date()) {
      throw ApiError.badRequest('Invalid or expired invitation token');
    }

    if (invitation.acceptedAt) {
      throw ApiError.conflict('Invitation token has already been used');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw ApiError.forbidden('This invitation token was sent to a different email address');
    }

    // Add or reactivate membership
    const existingMembership = await this.memberRepository.findMembership(
      invitation.organizationId,
      userId
    );

    if (existingMembership) {
      await this.memberRepository.updateRole(existingMembership.id, invitation.role as Role);
    } else {
      await this.memberRepository.addMember(
        invitation.organizationId,
        userId,
        invitation.role as Role
      );
    }

    await this.invitationRepository.markAccepted(invitation.id);

    await auditService.log({
      organizationId: invitation.organizationId,
      actorId: userId,
      actorEmail: user.email,
      actorRole: invitation.role,
      module: 'ORGANIZATION',
      action: 'ACCEPT_INVITATION',
      entityType: 'INVITATION',
      entityId: invitation.id,
    });

    logger.info({ userId, organizationId: invitation.organizationId }, 'Invitation accepted');

    return this.getOrganizationDetails(invitation.organizationId, userId);
  }

  public async listMembers(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMemberDto[]> {
    const membership = await this.memberRepository.findMembership(organizationId, userId);
    const requestingUser = await this.userRepository.findById(userId);

    if ((!membership || !membership.isActive) && !requestingUser?.isPlatformUser) {
      throw ApiError.forbidden('You must be a member of this organization to view members');
    }

    const members = await this.memberRepository.listMembers(organizationId);

    // Filter out Super Admins from organization member list unless the requesting user is a Super Admin
    const filteredMembers = members.filter((m) => {
      const isSuperAdmin = m.role === Role.SUPER_ADMIN || (m.user as any).isPlatformUser;
      if (isSuperAdmin && !requestingUser?.isPlatformUser) {
        return false;
      }
      return true;
    });

    return filteredMembers.map((m) => ({
      id: m.id,
      organizationId: m.organizationId,
      userId: m.userId,
      role: m.role as Role,
      joinedAt: m.joinedAt.toISOString(),
      isActive: m.isActive,
      user: {
        id: m.user.id,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        email: m.user.email,
        avatar: m.user.avatar,
        emailVerified: m.user.emailVerified,
        isActive: m.user.isActive,
        createdAt: m.user.createdAt.toISOString(),
      },
    }));
  }

  public async createMemberDirect(
    organizationId: string,
    actorId: string,
    data: CreateMemberDirectRequest
  ): Promise<CreateMemberResponse> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw ApiError.notFound('Actor user not found');

    const actorMembership = await this.memberRepository.findMembership(organizationId, actorId);
    if (
      !actor.isPlatformUser &&
      (!actorMembership || !actorMembership.isActive || actorMembership.role !== Role.ADMIN)
    ) {
      throw ApiError.forbidden('Only Organization Admins can add members');
    }

    let user = await this.userRepository.findByEmail(data.email);
    if (user) {
      const existingMembership = await this.memberRepository.findMembership(
        organizationId,
        user.id
      );
      if (existingMembership) {
        throw ApiError.conflict('User is already a member of this organization');
      }
    }

    const authMode = data.authMode || 'DIRECT';
    let tempPassword: string | undefined;
    let invitationToken: string | undefined;

    if (authMode === 'DIRECT') {
      if (!user) {
        tempPassword =
          data.password || `UserPass!${Math.random().toString(36).substring(2, 8)}#2026`;
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        user = await this.userRepository.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash,
          isActive: true,
          isPlatformUser: false,
        });
      }

      const member = await this.memberRepository.addMember(organizationId, user.id, data.role);

      await auditService.log({
        organizationId,
        actorId,
        actorEmail: actor.email,
        actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : actorMembership?.role || 'ADMIN',
        module: 'ORGANIZATION',
        action: 'USER_CREATED',
        entityType: 'USER',
        entityId: user.id,
        newState: { organizationId, userId: user.id, role: data.role, email: user.email },
      });

      return {
        member: {
          id: member.id,
          organizationId: member.organizationId,
          userId: member.userId,
          role: member.role as Role,
          joinedAt: member.joinedAt.toISOString(),
          isActive: member.isActive,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
          },
        },
        authMode: 'DIRECT',
        temporaryPassword: tempPassword,
      };
    } else {
      const token = randomUUID();
      const invitation = await this.invitationRepository.createInvitation(
        organizationId,
        data.email,
        actorId,
        token,
        data.role,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      invitationToken = invitation.token;

      if (!user) {
        tempPassword = `InvitePass!${Math.random().toString(36).substring(2, 8)}#2026`;
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        user = await this.userRepository.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          passwordHash,
          isActive: true,
          isPlatformUser: false,
        });
      }

      const member = await this.memberRepository.addMember(organizationId, user.id, data.role);

      await auditService.log({
        organizationId,
        actorId,
        actorEmail: actor.email,
        actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : actorMembership?.role || 'ADMIN',
        module: 'ORGANIZATION',
        action: 'INVITATION_SENT',
        entityType: 'INVITATION',
        entityId: invitation.id,
        newState: { organizationId, email: data.email, role: data.role, token },
      });

      return {
        member: {
          id: member.id,
          organizationId: member.organizationId,
          userId: member.userId,
          role: member.role as Role,
          joinedAt: member.joinedAt.toISOString(),
          isActive: member.isActive,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
          },
        },
        authMode: 'INVITATION',
        invitationToken,
      };
    }
  }

  public async updateMember(
    organizationId: string,
    actorId: string,
    memberId: string,
    data: UpdateMemberRequest
  ): Promise<OrganizationMemberDto> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw ApiError.notFound('Actor not found');

    const member = await this.memberRepository.findById(memberId);
    if (!member || member.organizationId !== organizationId) {
      throw ApiError.notFound('Member not found in this organization');
    }

    const previousRole = member.role;
    const previousStatus = member.isActive;

    let updated = member;

    if (data.role && data.role !== member.role) {
      updated = await this.memberRepository.updateRole(memberId, data.role as any);
      await auditService.log({
        organizationId,
        actorId,
        actorEmail: actor.email,
        actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
        module: 'ORGANIZATION',
        action: 'ROLE_CHANGED',
        entityType: 'USER',
        entityId: member.userId,
        previousState: { role: previousRole },
        newState: { role: data.role },
      });
    }

    if (data.isActive !== undefined && data.isActive !== member.isActive) {
      updated = await this.memberRepository.updateStatus(memberId, data.isActive);
      await auditService.log({
        organizationId,
        actorId,
        actorEmail: actor.email,
        actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
        module: 'ORGANIZATION',
        action: data.isActive ? 'USER_ENABLED' : 'USER_DISABLED',
        entityType: 'USER',
        entityId: member.userId,
        previousState: { isActive: previousStatus },
        newState: { isActive: data.isActive },
      });
    }

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      userId: updated.userId,
      role: updated.role as Role,
      joinedAt: updated.joinedAt.toISOString(),
      isActive: updated.isActive,
      user: {
        id: updated.user.id,
        firstName: updated.user.firstName,
        lastName: updated.user.lastName,
        email: updated.user.email,
        avatar: updated.user.avatar,
        emailVerified: updated.user.emailVerified,
        isActive: updated.user.isActive,
        createdAt: updated.user.createdAt.toISOString(),
      },
    };
  }

  public async removeMember(
    organizationId: string,
    actorId: string,
    memberId: string
  ): Promise<void> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw ApiError.notFound('Actor not found');

    const member = await this.memberRepository.findById(memberId);
    if (!member || member.organizationId !== organizationId) {
      throw ApiError.notFound('Member not found in this organization');
    }

    await this.memberRepository.removeMember(memberId);

    await auditService.log({
      organizationId,
      actorId,
      actorEmail: actor.email,
      actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
      module: 'ORGANIZATION',
      action: 'USER_DELETED',
      entityType: 'USER',
      entityId: member.userId,
      previousState: { organizationId, userId: member.userId, role: member.role },
    });
  }

  public async resetMemberPassword(
    organizationId: string,
    actorId: string,
    memberId: string
  ): Promise<{ temporaryPassword: string }> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw ApiError.notFound('Actor not found');

    const member = await this.memberRepository.findById(memberId);
    if (!member || member.organizationId !== organizationId) {
      throw ApiError.notFound('Member not found in this organization');
    }

    const temporaryPassword = `TempPass!${randomUUID().slice(0, 8)}#2026`;
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    await prisma.user.update({
      where: { id: member.userId },
      data: { passwordHash },
    });

    await auditService.log({
      organizationId,
      actorId,
      actorEmail: actor.email,
      actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
      module: 'ORGANIZATION',
      action: 'PASSWORD_RESET',
      entityType: 'USER',
      entityId: member.userId,
    });

    return { temporaryPassword };
  }

  public async listInvitations(organizationId: string): Promise<InvitationDto[]> {
    const invitations = await this.invitationRepository.listPendingInvitations(organizationId);
    return invitations.map((inv) => ({
      id: inv.id,
      organizationId: inv.organizationId,
      organizationName: inv.organization.name,
      email: inv.email,
      invitedBy: inv.invitedBy,
      invitedByName: `${inv.inviter.firstName} ${inv.inviter.lastName}`,
      role: inv.role as Role,
      token: inv.token,
      expiry: inv.expiry.toISOString(),
      acceptedAt: inv.acceptedAt ? inv.acceptedAt.toISOString() : null,
    }));
  }

  public async resendInvitation(
    organizationId: string,
    actorId: string,
    invitationId: string
  ): Promise<InvitationDto> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw ApiError.notFound('Actor not found');

    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation || invitation.organizationId !== organizationId) {
      throw ApiError.notFound('Invitation not found in this organization');
    }

    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updated = await this.invitationRepository.updateExpiry(invitationId, newExpiry);

    await auditService.log({
      organizationId,
      actorId,
      actorEmail: actor.email,
      actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
      module: 'ORGANIZATION',
      action: 'INVITATION_SENT',
      entityType: 'INVITATION',
      entityId: invitationId,
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      organizationName: invitation.organization.name,
      email: updated.email,
      invitedBy: updated.invitedBy,
      invitedByName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
      role: updated.role as Role,
      token: updated.token,
      expiry: updated.expiry.toISOString(),
      acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : null,
    };
  }

  public async cancelInvitation(
    organizationId: string,
    actorId: string,
    invitationId: string
  ): Promise<void> {
    const actor = await this.userRepository.findById(actorId);
    if (!actor) throw ApiError.notFound('Actor not found');

    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation || invitation.organizationId !== organizationId) {
      throw ApiError.notFound('Invitation not found in this organization');
    }

    await this.invitationRepository.deleteInvitation(invitationId);

    await auditService.log({
      organizationId,
      actorId,
      actorEmail: actor.email,
      actorRole: actor.isPlatformUser ? 'SUPER_ADMIN' : 'ADMIN',
      module: 'ORGANIZATION',
      action: 'INVITATION_CANCELLED',
      entityType: 'INVITATION',
      entityId: invitationId,
    });
  }
}
