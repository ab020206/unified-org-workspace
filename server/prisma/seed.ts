import {
  PrismaClient,
  Role,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  PullRequestStatus,
  ReviewDecisionType,
  OrganizationConnectionStatus,
  SharedResourceType,
  SharePermission,
  DigestStatus,
  NotificationType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEMO_USERS } from '../../packages/shared-config/demoUsers';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting comprehensive database seeding for Enterprise Demo Environment...');

  const demoPasswordHash = await bcrypt.hash('Demo@12345', 10);

  // 1. Create/Update Pre-created Organizations (2 Organizations)
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme-tech' },
    update: {
      name: 'Acme Technologies',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    },
    create: {
      name: 'Acme Technologies',
      slug: 'acme-tech',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      createdBy: 'system-seed',
    },
  });

  const novaOrg = await prisma.organization.upsert({
    where: { slug: 'nova-health' },
    update: {
      name: 'Nova Health Systems',
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80',
    },
    create: {
      name: 'Nova Health Systems',
      slug: 'nova-health',
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80',
      createdBy: 'system-seed',
    },
  });

  console.info('  ✔ 2 Organizations created (Acme Technologies, Nova Health Systems)');

  // 2. Create All Demo Users & Memberships
  const userMap: Record<string, string> = {};

  for (const userConfig of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userConfig.email },
      update: {
        passwordHash: demoPasswordHash,
        firstName: userConfig.firstName,
        lastName: userConfig.lastName,
        avatar: userConfig.avatar,
        emailVerified: true,
        isActive: true,
        isPlatformUser: userConfig.roleBadge === 'SUPER_ADMIN',
      },
      create: {
        email: userConfig.email,
        firstName: userConfig.firstName,
        lastName: userConfig.lastName,
        passwordHash: demoPasswordHash,
        avatar: userConfig.avatar,
        emailVerified: true,
        isActive: true,
        isPlatformUser: userConfig.roleBadge === 'SUPER_ADMIN',
      },
    });

    userMap[userConfig.email] = user.id;

    // Global Super Admin and Auditor accounts govern the platform globally and do not belong to a specific tenant
    if (userConfig.organizationSlug !== 'global-platform' && userConfig.roleBadge !== 'SUPER_ADMIN' && userConfig.roleBadge !== 'AUDITOR') {
      const targetOrgId = userConfig.organizationSlug === 'nova-health' ? novaOrg.id : acmeOrg.id;
      const roleEnum = Role[userConfig.roleBadge as keyof typeof Role] || Role.GUEST;

      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: targetOrgId,
            userId: user.id,
          },
        },
        update: { role: roleEnum },
        create: {
          organizationId: targetOrgId,
          userId: user.id,
          role: roleEnum,
        },
      });
    } else {
      // Remove any stale organization membership for global accounts
      await prisma.organizationMember.deleteMany({
        where: { userId: user.id },
      });
    }
  }

  const acmeAdminId = userMap['admin@acme.demo'];
  const supportAgentId = userMap['support@acme.demo'];
  const reviewerId = userMap['reviewer@acme.demo'];
  const novaAdminId = userMap['admin@nova.demo'];

  // 3. Seed 50 Users Total & 20 Members for Acme Technologies
  const existingUserCount = await prisma.user.count();
  if (existingUserCount < 50) {
    const rolesList = [Role.SUPPORT_AGENT, Role.REVIEWER, Role.GUEST, Role.ADMIN];
    for (let i = existingUserCount + 1; i <= 50; i++) {
      const role = rolesList[i % rolesList.length];
      const email = `platform.user.${i}@enterprise.demo`;
      const newUser = await prisma.user.upsert({
        where: { email },
        update: { isActive: true },
        create: {
          email,
          firstName: `User${i}`,
          lastName: `Enterprise`,
          passwordHash: demoPasswordHash,
          avatar: `U${i}`,
          emailVerified: true,
          isActive: true,
        },
      });

      // Add to Acme Org to reach 20+ members
      if (i <= 25) {
        await prisma.organizationMember.upsert({
          where: {
            organizationId_userId: {
              organizationId: acmeOrg.id,
              userId: newUser.id,
            },
          },
          update: { role },
          create: {
            organizationId: acmeOrg.id,
            userId: newUser.id,
            role,
          },
        });
      }
    }
  }

  const totalUserCount = await prisma.user.count();
  const acmeMemberCount = await prisma.organizationMember.count({ where: { organizationId: acmeOrg.id } });
  console.info(`  ✔ ${totalUserCount} Platform Users created | ${acmeMemberCount} Acme Members created`);

  // 4. Feature Flags
  const flagKeys = [
    { key: 'AI_DIGEST', desc: 'AI Executive Summary Generator' },
    { key: 'CROSS_ORG_SHARING', desc: 'Cross-Organization Sharing' },
    { key: 'REVIEW_CONSOLE', desc: 'Code Review Console' },
    { key: 'NOTIFICATIONS', desc: 'Notification Engine' },
    { key: 'ADVANCED_ANALYTICS', desc: 'Advanced Analytics Dashboard' },
  ];

  for (const flag of flagKeys) {
    const existing = await prisma.featureFlag.findFirst({
      where: { key: flag.key, organizationId: null },
    });
    if (!existing) {
      await prisma.featureFlag.create({
        data: { key: flag.key, description: flag.desc, enabled: true, organizationId: null },
      });
    }
  }

  // 5. Seed Exactly 20 Tickets (All assigned to Support Agent Rohan Gupta)
  const categories = [TicketCategory.GENERAL, TicketCategory.BUG, TicketCategory.FEATURE_REQUEST, TicketCategory.BILLING, TicketCategory.TECHNICAL, TicketCategory.ACCOUNT];
  const priorities = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.URGENT];
  const statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_RESPONSE, TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.REOPENED];

  let ticketCount = await prisma.ticket.count({ where: { organizationId: acmeOrg.id } });
  if (ticketCount < 20) {
    for (let i = ticketCount + 1; i <= 20; i++) {
      const status = statuses[i % statuses.length];
      const priority = priorities[i % priorities.length];
      const category = categories[i % categories.length];

      const ticket = await prisma.ticket.create({
        data: {
          organizationId: acmeOrg.id,
          title: `Ticket #${i}: Support Request - ${category} Module`,
          description: `Customer reported issue #${i}. SLA tracking priority assigned. Requires agent verification.`,
          status,
          priority,
          category,
          createdBy: acmeAdminId,
          assignedTo: supportAgentId,
        },
      });

      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          userId: supportAgentId,
          message: `Support Agent Rohan Gupta acknowledged ticket #${i}. Status updated to ${status}.`,
        },
      });

      if (i <= 5) {
        await prisma.ticketAttachment.create({
          data: {
            ticketId: ticket.id,
            uploadedBy: supportAgentId,
            fileName: `system_dump_ticket_${i}.log`,
            fileUrl: `/uploads/mock_log_${i}.txt`,
            mimeType: 'text/plain',
            fileSize: 1024 * i,
          },
        });
      }
    }
  }
  console.info('  ✔ 20 Support Tickets created and assigned to Support Agent');

  // 6. Seed Exactly 12 Pull Requests
  const prStatuses = [
    PullRequestStatus.DRAFT,
    PullRequestStatus.READY_FOR_REVIEW,
    PullRequestStatus.UNDER_REVIEW,
    PullRequestStatus.APPROVED,
    PullRequestStatus.REJECTED,
    PullRequestStatus.MERGED,
  ];

  let prCount = await prisma.pullRequest.count({ where: { organizationId: acmeOrg.id } });
  if (prCount < 12) {
    for (let i = prCount + 1; i <= 12; i++) {
      const prStatus = prStatuses[i % prStatuses.length];

      const pr = await prisma.pullRequest.create({
        data: {
          organizationId: acmeOrg.id,
          title: `PR #${i}: Core Subsystem Refactor & Performance Optimization ${i}`,
          description: `Pull Request #${i} submitted for code review and approval.`,
          status: prStatus,
          createdBy: acmeAdminId,
          mergedBy: prStatus === PullRequestStatus.MERGED ? reviewerId : null,
          requiredApprovals: 1,
        },
      });

      await prisma.pullRequestVersion.create({
        data: {
          pullRequestId: pr.id,
          versionNumber: 1,
          title: `Version 1.0 for PR #${i}`,
          description: `Initial commit payload for PR #${i}`,
          createdBy: acmeAdminId,
        },
      });

      await prisma.pullRequestReviewer.create({
        data: {
          pullRequestId: pr.id,
          reviewerId: reviewerId,
        },
      });

      if (prStatus === PullRequestStatus.APPROVED || prStatus === PullRequestStatus.MERGED) {
        await prisma.reviewDecision.create({
          data: {
            pullRequestId: pr.id,
            reviewerId: reviewerId,
            decision: ReviewDecisionType.APPROVED,
            comment: 'Code review complete. Passes all automated linting and security scanners.',
          },
        });
      }
    }
  }
  console.info('  ✔ 12 Pull Requests created for Reviewer');

  // 7. Seed Exactly 100 Audit Logs
  let auditCount = await prisma.auditLog.count({ where: { organizationId: acmeOrg.id } });
  if (auditCount < 100) {
    const modules = ['AUTHENTICATION', 'SUPPORT_HUB', 'REVIEW_CONSOLE', 'AUDIT_STREAM', 'SECURITY', 'TENANT_CONFIG'];
    const actions = ['USER_LOGIN', 'TICKET_CREATE', 'PR_APPROVE', 'SCOPE_GRANT', 'FLAG_TOGGLE', 'SESSION_REVOKE', 'PERMISSION_CHANGE', 'LOG_EXPORT'];

    const auditData = [];
    for (let i = auditCount + 1; i <= 100; i++) {
      const mod = modules[i % modules.length];
      const act = actions[i % actions.length];
      auditData.push({
        organizationId: acmeOrg.id,
        actorId: acmeAdminId,
        actorEmail: 'admin@acme.demo',
        actorRole: 'ADMIN',
        module: mod,
        action: act,
        entityType: 'SystemResource',
        entityId: `entity-resource-${i}`,
        previousState: { status: 'OLD', version: i },
        newState: { status: 'NEW', version: i + 1 },
        ipAddress: `192.168.1.${(i % 50) + 1}`,
        userAgent: 'Mozilla/5.0 Enterprise-Agent',
      });
    }
    await prisma.auditLog.createMany({ data: auditData });
  }
  console.info('  ✔ 100 Audit Entries created with state tracking');

  // 8. Seed 5 Shared Resources & Cross-Org Connections
  let conn = await prisma.organizationConnection.findFirst({
    where: { sourceOrganizationId: acmeOrg.id, targetOrganizationId: novaOrg.id },
  });
  if (!conn) {
    conn = await prisma.organizationConnection.create({
      data: {
        sourceOrganizationId: acmeOrg.id,
        targetOrganizationId: novaOrg.id,
        requestedBy: acmeAdminId,
        approvedBy: novaAdminId,
        status: OrganizationConnectionStatus.ACCEPTED,
      },
    });
  }

  const sampleTickets = await prisma.ticket.findMany({ where: { organizationId: acmeOrg.id }, take: 5 });
  for (let i = 0; i < sampleTickets.length; i++) {
    const t = sampleTickets[i];
    const existingShare = await prisma.sharedResource.findFirst({
      where: { resourceId: t.id, sharedWithOrganizationId: novaOrg.id },
    });
    if (!existingShare) {
      await prisma.sharedResource.create({
        data: {
          resourceType: SharedResourceType.TICKET,
          resourceId: t.id,
          ownerOrganizationId: acmeOrg.id,
          sharedWithOrganizationId: novaOrg.id,
          permission: SharePermission.READ,
          sharedBy: acmeAdminId,
        },
      });
    }
  }
  console.info('  ✔ 5 Shared Resources created for Guest Collaborator');

  // 9. Seed Invitations & Notifications
  let invCount = await prisma.invitation.count({ where: { organizationId: acmeOrg.id } });
  if (invCount < 3) {
    for (let i = invCount + 1; i <= 3; i++) {
      await prisma.invitation.create({
        data: {
          organizationId: acmeOrg.id,
          email: `invite_${i}@partner.com`,
          invitedBy: acmeAdminId,
          role: Role.GUEST,
          token: `demo-invite-token-${i}-${Date.now()}`,
          expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  let notifCount = await prisma.notification.count({ where: { organizationId: acmeOrg.id } });
  if (notifCount < 20) {
    const notifData = [];
    for (let i = notifCount + 1; i <= 20; i++) {
      notifData.push({
        userId: acmeAdminId,
        organizationId: acmeOrg.id,
        type: NotificationType.SYSTEM,
        title: `Enterprise Notification #${i}`,
        message: `System alert regarding ticket or security event #${i}.`,
        isRead: i % 2 === 0,
      });
    }
    await prisma.notification.createMany({ data: notifData });
  }

  console.info('🎉 Enterprise Demo Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
