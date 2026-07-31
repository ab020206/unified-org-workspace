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
  AnomalySeverity,
  DigestFrequency,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting Production-Grade Idempotent Demo Seeding...');

  // 1. Clean existing dynamic records to ensure 100% clean data with zero duplicates
  console.info('  • Cleaning existing dynamic records...');
  await prisma.auditMetadata.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.digest.deleteMany({});
  await prisma.sharedAccess.deleteMany({});
  await prisma.sharedResource.deleteMany({});
  await prisma.pullRequestActivity.deleteMany({});
  await prisma.reviewComment.deleteMany({});
  await prisma.pullRequestVersion.deleteMany({});
  await prisma.reviewDecision.deleteMany({});
  await prisma.pullRequestReviewer.deleteMany({});
  await prisma.pullRequest.deleteMany({});
  await prisma.ticketActivity.deleteMany({});
  await prisma.ticketAttachment.deleteMany({});
  await prisma.ticketComment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.anomalyAlert.deleteMany({});
  await prisma.permissionOverride.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.organizationConnection.deleteMany({});

  // Password for every demo account: Demo@12345
  const demoPasswordHash = await bcrypt.hash('Demo@12345', 10);

  // 2. Seed Platform Super Admin (No organization, no OrganizationMember record)
  console.info('  • Seeding Platform Super Admin (superadmin@platform.demo)...');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@platform.demo' },
    update: {
      firstName: 'Platform',
      lastName: 'SuperAdmin',
      passwordHash: demoPasswordHash,
      isPlatformUser: true,
      emailVerified: true,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    create: {
      email: 'superadmin@platform.demo',
      firstName: 'Platform',
      lastName: 'SuperAdmin',
      passwordHash: demoPasswordHash,
      isPlatformUser: true,
      emailVerified: true,
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  });

  // 3. Seed Organizations
  console.info('  • Seeding Organizations (Acme Technologies, Nova Healthcare, Zenith Logistics)...');
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme-technologies' },
    update: {
      name: 'Acme Technologies',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    },
    create: {
      name: 'Acme Technologies',
      slug: 'acme-technologies',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      createdBy: superAdmin.id,
    },
  });

  const novaOrg = await prisma.organization.upsert({
    where: { slug: 'nova-healthcare' },
    update: {
      name: 'Nova Healthcare',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    },
    create: {
      name: 'Nova Healthcare',
      slug: 'nova-healthcare',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
      createdBy: superAdmin.id,
    },
  });

  const zenithOrg = await prisma.organization.upsert({
    where: { slug: 'zenith-logistics' },
    update: {
      name: 'Zenith Logistics',
      logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=80',
    },
    create: {
      name: 'Zenith Logistics',
      slug: 'zenith-logistics',
      logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=80',
      createdBy: superAdmin.id,
    },
  });

  // 4. Seed Standard Users & Roles
  console.info('  • Seeding Users & Roles...');
  const userSpecs = [
    // Organization Admins
    { email: 'admin@acme.demo', firstName: 'Ananya', lastName: 'Patel', orgId: acmeOrg.id, role: Role.ADMIN },
    { email: 'admin@nova.demo', firstName: 'Vikram', lastName: 'Mehta', orgId: novaOrg.id, role: Role.ADMIN },
    { email: 'admin@zenith.demo', firstName: 'Rajesh', lastName: 'Verma', orgId: zenithOrg.id, role: Role.ADMIN },

    // Support Agents
    { email: 'support1@acme.demo', firstName: 'Sunita', lastName: 'Rao', orgId: acmeOrg.id, role: Role.SUPPORT_AGENT },
    { email: 'support2@acme.demo', firstName: 'Amit', lastName: 'Kumar', orgId: acmeOrg.id, role: Role.SUPPORT_AGENT },
    { email: 'support@nova.demo', firstName: 'Priya', lastName: 'Sharma', orgId: novaOrg.id, role: Role.SUPPORT_AGENT },
    { email: 'support@zenith.demo', firstName: 'Karan', lastName: 'Singh', orgId: zenithOrg.id, role: Role.SUPPORT_AGENT },

    // Reviewers
    { email: 'reviewer@acme.demo', firstName: 'Rohan', lastName: 'Gupta', orgId: acmeOrg.id, role: Role.REVIEWER },
    { email: 'reviewer@nova.demo', firstName: 'Deepa', lastName: 'Reddy', orgId: novaOrg.id, role: Role.REVIEWER },
    { email: 'reviewer@zenith.demo', firstName: 'Vikramaditya', lastName: 'Verma', orgId: zenithOrg.id, role: Role.REVIEWER },

    // Guests & Auditors
    { email: 'guest@nova.demo', firstName: 'Varun', lastName: 'Nair', orgId: novaOrg.id, role: Role.GUEST },
    { email: 'guest@zenith.demo', firstName: 'Neha', lastName: 'Joshi', orgId: zenithOrg.id, role: Role.GUEST },
    { email: 'auditor@acme.demo', firstName: 'Aditya', lastName: 'Nair', orgId: acmeOrg.id, role: Role.AUDITOR },
  ];

  const userMap = new Map<string, any>();

  for (const u of userSpecs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: demoPasswordHash,
        isPlatformUser: false,
        emailVerified: true,
        isActive: true,
      },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: demoPasswordHash,
        isPlatformUser: false,
        emailVerified: true,
        isActive: true,
      },
    });

    userMap.set(u.email, user);

    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: u.orgId, userId: user.id } },
      update: { role: u.role, isActive: true },
      create: {
        organizationId: u.orgId,
        userId: user.id,
        role: u.role,
        isActive: true,
      },
    });

    await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        emailDigestFrequency: DigestFrequency.DAILY,
        emailInstantEvents: true,
        pushEnabled: true,
      },
    });
  }

  // 5. Seed Multi-Membership Users
  console.info('  • Seeding Multi-Membership Users (John, Sarah, Michael)...');
  
  // John (Admin at Acme, Reviewer at Zenith)
  const johnUser = await prisma.user.upsert({
    where: { email: 'john@demo.com' },
    update: { firstName: 'John', lastName: 'Doe', passwordHash: demoPasswordHash, isPlatformUser: false, emailVerified: true, isActive: true },
    create: { email: 'john@demo.com', firstName: 'John', lastName: 'Doe', passwordHash: demoPasswordHash, isPlatformUser: false, emailVerified: true, isActive: true },
  });
  userMap.set('john@demo.com', johnUser);
  await prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: acmeOrg.id, userId: johnUser.id } }, update: { role: Role.ADMIN, isActive: true }, create: { organizationId: acmeOrg.id, userId: johnUser.id, role: Role.ADMIN, isActive: true } });
  await prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: zenithOrg.id, userId: johnUser.id } }, update: { role: Role.REVIEWER, isActive: true }, create: { organizationId: zenithOrg.id, userId: johnUser.id, role: Role.REVIEWER, isActive: true } });

  // Sarah (Support Agent at Acme, Support Agent at Nova)
  const sarahUser = await prisma.user.upsert({
    where: { email: 'sarah@demo.com' },
    update: { firstName: 'Sarah', lastName: 'Connor', passwordHash: demoPasswordHash, isPlatformUser: false, emailVerified: true, isActive: true },
    create: { email: 'sarah@demo.com', firstName: 'Sarah', lastName: 'Connor', passwordHash: demoPasswordHash, isPlatformUser: false, emailVerified: true, isActive: true },
  });
  userMap.set('sarah@demo.com', sarahUser);
  await prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: acmeOrg.id, userId: sarahUser.id } }, update: { role: Role.SUPPORT_AGENT, isActive: true }, create: { organizationId: acmeOrg.id, userId: sarahUser.id, role: Role.SUPPORT_AGENT, isActive: true } });
  await prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: novaOrg.id, userId: sarahUser.id } }, update: { role: Role.SUPPORT_AGENT, isActive: true }, create: { organizationId: novaOrg.id, userId: sarahUser.id, role: Role.SUPPORT_AGENT, isActive: true } });

  // Michael (Reviewer at Nova, Guest at Zenith)
  const michaelUser = await prisma.user.upsert({
    where: { email: 'michael@demo.com' },
    update: { firstName: 'Michael', lastName: 'Scott', passwordHash: demoPasswordHash, isPlatformUser: false, emailVerified: true, isActive: true },
    create: { email: 'michael@demo.com', firstName: 'Michael', lastName: 'Scott', passwordHash: demoPasswordHash, isPlatformUser: false, emailVerified: true, isActive: true },
  });
  userMap.set('michael@demo.com', michaelUser);
  await prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: novaOrg.id, userId: michaelUser.id } }, update: { role: Role.REVIEWER, isActive: true }, create: { organizationId: novaOrg.id, userId: michaelUser.id, role: Role.REVIEWER, isActive: true } });
  await prisma.organizationMember.upsert({ where: { organizationId_userId: { organizationId: zenithOrg.id, userId: michaelUser.id } }, update: { role: Role.GUEST, isActive: true }, create: { organizationId: zenithOrg.id, userId: michaelUser.id, role: Role.GUEST, isActive: true } });

  // 6. Cross-Organization Connections
  console.info('  • Seeding Cross-Organization Connections...');
  await prisma.organizationConnection.upsert({
    where: {
      sourceOrganizationId_targetOrganizationId: {
        sourceOrganizationId: acmeOrg.id,
        targetOrganizationId: novaOrg.id,
      },
    },
    update: { status: OrganizationConnectionStatus.ACCEPTED },
    create: {
      sourceOrganizationId: acmeOrg.id,
      targetOrganizationId: novaOrg.id,
      status: OrganizationConnectionStatus.ACCEPTED,
      requestedBy: userMap.get('admin@acme.demo').id,
      approvedBy: userMap.get('admin@nova.demo').id,
      approvedAt: new Date(),
    },
  });

  await prisma.organizationConnection.upsert({
    where: {
      sourceOrganizationId_targetOrganizationId: {
        sourceOrganizationId: zenithOrg.id,
        targetOrganizationId: acmeOrg.id,
      },
    },
    update: { status: OrganizationConnectionStatus.ACCEPTED },
    create: {
      sourceOrganizationId: zenithOrg.id,
      targetOrganizationId: acmeOrg.id,
      status: OrganizationConnectionStatus.ACCEPTED,
      requestedBy: userMap.get('admin@zenith.demo').id,
      approvedBy: userMap.get('admin@acme.demo').id,
      approvedAt: new Date(),
    },
  });

  // 7. Seed Support Tickets (Acme: 12, Nova: 8, Zenith: 10)
  console.info('  • Seeding Support Tickets (12 Acme, 8 Nova, 10 Zenith)...');
  const orgTicketsConfig = [
    { org: acmeOrg, count: 12, admin: userMap.get('admin@acme.demo'), support: userMap.get('support1@acme.demo'), reviewer: userMap.get('reviewer@acme.demo') },
    { org: novaOrg, count: 8, admin: userMap.get('admin@nova.demo'), support: userMap.get('support@nova.demo'), reviewer: userMap.get('reviewer@nova.demo') },
    { org: zenithOrg, count: 10, admin: userMap.get('admin@zenith.demo'), support: userMap.get('support@zenith.demo'), reviewer: userMap.get('reviewer@zenith.demo') },
  ];

  const statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_RESPONSE, TicketStatus.RESOLVED, TicketStatus.CLOSED];
  const priorities = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.URGENT];
  const categories = [TicketCategory.BUG, TicketCategory.FEATURE_REQUEST, TicketCategory.TECHNICAL, TicketCategory.ACCOUNT, TicketCategory.BILLING];

  const createdTickets: any[] = [];

  for (const cfg of orgTicketsConfig) {
    for (let i = 1; i <= cfg.count; i++) {
      const ticketStatus = statuses[i % statuses.length];
      const ticketPriority = priorities[i % priorities.length];
      const ticketCategory = categories[i % categories.length];

      const ticket = await prisma.ticket.create({
        data: {
          organizationId: cfg.org.id,
          title: `[${cfg.org.name}] Issue #${i * 100 + 4}: Optimization & Security Audit`,
          description: `Comprehensive technical details regarding ticket #${i} for ${cfg.org.name}. System telemetry logs, reproduction steps, and trace files attached.`,
          status: ticketStatus,
          priority: ticketPriority,
          category: ticketCategory,
          createdBy: cfg.admin.id,
          assignedTo: cfg.support.id,
          comments: {
            create: [
              { userId: cfg.support.id, message: `Support triage initiated. Investigating logs for issue #${i}.` },
              { userId: cfg.reviewer.id, message: `Code review and patch verification completed for ${cfg.org.name}.` },
              { userId: cfg.admin.id, message: `Approved resolution for deployment.` },
            ],
          },
          attachments: {
            create: [
              { uploadedBy: cfg.admin.id, fileName: `telemetry-trace-${i}.log`, fileUrl: 'https://example.com/logs/trace.log', mimeType: 'text/plain', fileSize: 32000 },
              { uploadedBy: cfg.support.id, fileName: `screenshot-issue-${i}.png`, fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', mimeType: 'image/png', fileSize: 1048576 },
            ],
          },
        },
      });
      createdTickets.push(ticket);
    }
  }

  // 8. Seed Shared Resource (Acme shares ticket with Nova)
  if (createdTickets.length > 0) {
    console.info('  • Seeding Shared Resource (Acme shares ticket with Nova)...');
    await prisma.sharedResource.create({
      data: {
        resourceType: SharedResourceType.TICKET,
        resourceId: createdTickets[0].id,
        ownerOrganizationId: acmeOrg.id,
        sharedWithOrganizationId: novaOrg.id,
        permission: SharePermission.READ,
        sharedBy: userMap.get('admin@acme.demo').id,
      },
    });
  }

  // 9. Seed Pull Requests / Reviews
  console.info('  • Seeding Pull Requests & Review Requests...');
  const prStatuses = [PullRequestStatus.UNDER_REVIEW, PullRequestStatus.APPROVED, PullRequestStatus.CHANGES_REQUESTED, PullRequestStatus.MERGED];
  for (let i = 1; i <= 9; i++) {
    const org = i % 3 === 0 ? acmeOrg : i % 3 === 1 ? novaOrg : zenithOrg;
    const author = userMap.get('admin@acme.demo');
    const reviewer = userMap.get('reviewer@acme.demo');
    const status = prStatuses[i % prStatuses.length];

    await prisma.pullRequest.create({
      data: {
        organizationId: org.id,
        title: `feat(${org.slug}): enterprise compliance module refactor (#${100 + i})`,
        description: `Refactoring authentication and audit log handlers for ${org.name}.`,
        status,
        createdBy: author.id,
        repoOwner: org.slug,
        repoName: 'enterprise-workspace-core',
        headBranch: `feature/branch-${i}`,
        baseBranch: 'main',
        commitSha: `f478a${i}b`,
        ciStatus: 'SUCCESS',
        checksStatus: 'PASSED',
        githubSyncStatus: 'SYNCED',
        reviewers: { create: [{ reviewerId: reviewer.id }] },
        decisions: {
          create: [{
            reviewerId: reviewer.id,
            decision: status === PullRequestStatus.APPROVED || status === PullRequestStatus.MERGED ? ReviewDecisionType.APPROVED : ReviewDecisionType.CHANGES_REQUESTED,
            comment: 'Architecture review verified.',
          }],
        },
      },
    });
  }

  // 10. Seed AI Digests
  console.info('  • Seeding AI Executive Digests...');
  for (const org of [acmeOrg, novaOrg, zenithOrg]) {
    await prisma.digest.create({
      data: {
        organizationId: org.id,
        userId: userMap.get('admin@acme.demo').id,
        title: `AI Daily Executive Summary - ${org.name}`,
        summary: `Executive Briefing for ${org.name}:\n- All tickets triaged and high-priority incidents resolved.\n- Pull request review queue clear.\n- Audit logging operational with zero security anomalies.`,
        status: DigestStatus.READY,
        modelUsed: 'gemini-2.5-flash',
        tokenUsage: 1650,
      },
    });
  }

  // 11. Seed Multi-Channel Notifications
  console.info('  • Seeding Multi-Channel Notifications...');
  for (const u of [johnUser, sarahUser, michaelUser, userMap.get('admin@acme.demo')]) {
    await prisma.notification.create({
      data: {
        userId: u.id,
        organizationId: acmeOrg.id,
        type: NotificationType.TICKET_ASSIGNED,
        title: '🎫 Ticket Assigned',
        message: `You have new pending tickets in your active workspace context.`,
        isRead: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: u.id,
        organizationId: acmeOrg.id,
        type: NotificationType.AI_DIGEST,
        title: '✨ AI Digest Ready',
        message: `Your daily executive AI digest briefing is available for review.`,
        isRead: true,
      },
    });
  }

  // 12. Seed Audit Logs
  console.info('  • Seeding Audit Logs...');
  const auditActions = ['USER_LOGIN', 'ORGANIZATION_SWITCHED', 'PLATFORM_VIEW_ENTERED', 'TICKET_CREATED', 'PR_APPROVED', 'DIGEST_GENERATED'];
  for (let i = 0; i < 30; i++) {
    const action = auditActions[i % auditActions.length];
    await prisma.auditLog.create({
      data: {
        organizationId: acmeOrg.id,
        actorId: superAdmin.id,
        actorEmail: superAdmin.email,
        actorRole: 'SUPER_ADMIN',
        module: 'ORGANIZATION',
        action,
        entityType: 'ORGANIZATION',
        entityId: acmeOrg.id,
        ipAddress: `192.168.1.${i + 10}`,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    });
  }

  // Summary Report
  const orgCount = await prisma.organization.count();
  const userCount = await prisma.user.count();
  const ticketCount = await prisma.ticket.count();
  const auditCount = await prisma.auditLog.count();

  console.info('\n==================================================');
  console.info('🚀 Production Seed Complete!');
  console.info('==================================================');
  console.info(`Organizations: ${orgCount}`);
  console.info(`Users: ${userCount}`);
  console.info(`Tickets: ${ticketCount}`);
  console.info(`Audit Logs: ${auditCount}`);
  console.info('==================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
