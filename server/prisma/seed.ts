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
  console.info('🌱 Starting Production-Quality Idempotent Demo Seeding...');

  const demoPasswordHash = await bcrypt.hash('Demo@12345', 10);

  // 1. Seed Organizations (Acme Technologies & Nova Healthcare)
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
      name: 'Nova Healthcare',
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80',
    },
    create: {
      name: 'Nova Healthcare',
      slug: 'nova-health',
      logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=80',
      createdBy: 'system-seed',
    },
  });

  console.info('  ✔ 2 Organizations created (Acme Technologies, Nova Healthcare)');

  // 2. Seed All Demo Users & Memberships
  const userMap: Record<string, string> = {};

  for (const userConfig of DEMO_USERS) {
    const isSuperAdmin = userConfig.roleBadge === 'SUPER_ADMIN';

    const user = await prisma.user.upsert({
      where: { email: userConfig.email },
      update: {
        passwordHash: demoPasswordHash,
        firstName: userConfig.firstName,
        lastName: userConfig.lastName,
        avatar: userConfig.avatar,
        emailVerified: true,
        isActive: true,
        isPlatformUser: isSuperAdmin,
      },
      create: {
        email: userConfig.email,
        firstName: userConfig.firstName,
        lastName: userConfig.lastName,
        passwordHash: demoPasswordHash,
        avatar: userConfig.avatar,
        emailVerified: true,
        isActive: true,
        isPlatformUser: isSuperAdmin,
      },
    });

    userMap[userConfig.email] = user.id;

    if (isSuperAdmin) {
      // Platform Super Admin must NOT belong to any organization
      await prisma.organizationMember.deleteMany({
        where: { userId: user.id },
      });
    } else {
      const targetOrgId = userConfig.organizationSlug === 'nova-health' ? novaOrg.id : acmeOrg.id;
      const roleEnum = Role[userConfig.roleBadge as keyof typeof Role] || Role.GUEST;

      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: targetOrgId,
            userId: user.id,
          },
        },
        update: { role: roleEnum, isActive: true },
        create: {
          organizationId: targetOrgId,
          userId: user.id,
          role: roleEnum,
          isActive: true,
        },
      });
    }
  }

  const superAdminId = userMap['superadmin@platform.demo'];
  const acmeAdminId = userMap['admin@acme.demo'];
  const acmeSupport1Id = userMap['support1@acme.demo'];
  const acmeSupport2Id = userMap['support2@acme.demo'];
  const acmeReviewerId = userMap['reviewer@acme.demo'];
  const acmeAuditorId = userMap['auditor@acme.demo'];

  const novaAdminId = userMap['admin@nova.demo'];
  const novaSupportId = userMap['support@nova.demo'];
  const novaReviewerId = userMap['reviewer@nova.demo'];
  const novaGuestId = userMap['guest@nova.demo'];

  console.info('  ✔ All required demo users and memberships created');

  // 3. Feature Flags
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

  // 4. Seed Acme Tickets (9 Realistic Tickets across all stages & priorities)
  const acmeTicketSpecs = [
    {
      title: 'Billing Module Webhook Retry Failure',
      desc: 'Webhook delivery failed for payment events during high traffic. Requires retry logic audit.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.URGENT,
      category: TicketCategory.BILLING,
      assignee: acmeSupport1Id,
    },
    {
      title: 'JWT Session Revocation Lag in Secondary Cluster',
      desc: 'Token revocation list shows 200ms latency on secondary regions. Need Redis cache sync.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: TicketCategory.TECHNICAL,
      assignee: acmeSupport1Id,
    },
    {
      title: 'Customer Feedback: Audit Trail Export Formatting',
      desc: 'CSV export truncates actor metadata column when UTF-8 BOM is missing.',
      status: TicketStatus.WAITING_FOR_RESPONSE,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.BUG,
      assignee: acmeSupport2Id,
    },
    {
      title: 'Feature Request: Dark Mode Palette Adjustment',
      desc: 'Add custom theme overrides for high contrast accessibility compliance.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      category: TicketCategory.FEATURE_REQUEST,
      assignee: acmeSupport2Id,
    },
    {
      title: 'SSO SAML Identity Provider Certificate Expiry Warning',
      desc: 'SAML IdP metadata certificate expires in 14 days. Renewal key exchange pending.',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.HIGH,
      category: TicketCategory.ACCOUNT,
      assignee: acmeSupport1Id,
    },
    {
      title: 'API Rate Limiter Edge Case Triggers 429 prematurely',
      desc: 'Burst limit window miscalculates sliding window sliding offset on burst load.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.BUG,
      assignee: acmeSupport2Id,
    },
    {
      title: 'PR Review Approval Rule Policy Clarification',
      desc: 'Inquire whether 2 approvals are needed for production release branches.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.LOW,
      category: TicketCategory.GENERAL,
      assignee: acmeSupport1Id,
    },
    {
      title: 'Database Query Timeout on Historical Audit Logs',
      desc: 'Filter query without index scan takes 4.2 seconds on 1M audit rows.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.URGENT,
      category: TicketCategory.TECHNICAL,
      assignee: acmeSupport1Id,
    },
    {
      title: 'Cross-Tenant Sharing Handshake Expiry Rule',
      desc: 'Connection requests should automatically expire after 14 days of inactivity.',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.FEATURE_REQUEST,
      assignee: acmeSupport2Id,
    },
  ];

  const seededAcmeTickets = [];
  for (let i = 0; i < acmeTicketSpecs.length; i++) {
    const spec = acmeTicketSpecs[i];
    let ticket = await prisma.ticket.findFirst({
      where: { organizationId: acmeOrg.id, title: spec.title },
    });

    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: {
          organizationId: acmeOrg.id,
          title: spec.title,
          description: spec.desc,
          status: spec.status,
          priority: spec.priority,
          category: spec.category,
          createdBy: acmeAdminId,
          assignedTo: spec.assignee,
        },
      });

      // Ticket Comment
      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          userId: spec.assignee,
          message: `Assigned agent investigated ticket. Current status is ${spec.status}.`,
        },
      });

      // Attachment for first 2 tickets
      if (i < 2) {
        await prisma.ticketAttachment.create({
          data: {
            ticketId: ticket.id,
            uploadedBy: spec.assignee,
            fileName: `diagnostic_trace_acme_${i + 1}.log`,
            fileUrl: `/uploads/diagnostic_trace_${i + 1}.txt`,
            mimeType: 'text/plain',
            fileSize: 2048 * (i + 1),
          },
        });
      }
    }
    seededAcmeTickets.push(ticket);
  }

  console.info('  ✔ Acme: 9 Tickets created with comments & attachments');

  // 5. Seed Nova Tickets (6 Realistic Tickets across all stages & priorities)
  const novaTicketSpecs = [
    {
      title: 'HIPAA Compliance Audit Log Exporter',
      desc: 'Requires verified encryption at rest for patient record activity streams.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      category: TicketCategory.TECHNICAL,
      assignee: novaSupportId,
    },
    {
      title: 'Patient Telehealth Portal SSO Connection',
      desc: 'OAuth handshake requires token refresh rotation policy check.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.ACCOUNT,
      assignee: novaSupportId,
    },
    {
      title: 'EHR Sync Notification Delay',
      desc: 'Real-time push alerts delayed by 15 seconds during peak hospital shift updates.',
      status: TicketStatus.WAITING_FOR_RESPONSE,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.BUG,
      assignee: novaSupportId,
    },
    {
      title: 'Medical Attachment Upload Size Quota Request',
      desc: 'Requesting file upload limit increase from 10MB to 50MB for medical imaging.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      category: TicketCategory.FEATURE_REQUEST,
      assignee: novaSupportId,
    },
    {
      title: 'Clinic Dashboard Loading Latency',
      desc: 'Clinic overview page takes 3 seconds to fetch active practitioner roster.',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.TECHNICAL,
      assignee: novaSupportId,
    },
    {
      title: 'Cross-Org Medical Record Review Access Request',
      desc: 'Nova specialists requesting partner review permissions for shared diagnostic case.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.GENERAL,
      assignee: novaSupportId,
    },
  ];

  for (const spec of novaTicketSpecs) {
    let ticket = await prisma.ticket.findFirst({
      where: { organizationId: novaOrg.id, title: spec.title },
    });

    if (!ticket) {
      ticket = await prisma.ticket.create({
        data: {
          organizationId: novaOrg.id,
          title: spec.title,
          description: spec.desc,
          status: spec.status,
          priority: spec.priority,
          category: spec.category,
          createdBy: novaAdminId,
          assignedTo: spec.assignee,
        },
      });

      await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          userId: spec.assignee,
          message: `Nova Healthcare support team updated ticket status to ${spec.status}.`,
        },
      });
    }
  }

  console.info('  ✔ Nova: 6 Tickets created with comments');

  // 6. Seed Acme Pull Requests (3 PR Reviews)
  const acmePRSpecs = [
    {
      title: 'PR #101: Implement Fine-Grained Permission Override Engine',
      desc: 'Adds granular permission override evaluation to authorization middleware.',
      status: PullRequestStatus.APPROVED,
    },
    {
      title: 'PR #102: Add Redis Rate Limiter Sliding Window Buffer',
      desc: 'Improves API rate limiting accuracy under high concurrent load.',
      status: PullRequestStatus.READY_FOR_REVIEW,
    },
    {
      title: 'PR #103: Refactor Multi-Tenant Isolation Middleware',
      desc: 'Ensures strict tenant resolution via X-Organization-Id header.',
      status: PullRequestStatus.MERGED,
    },
  ];

  for (let i = 0; i < acmePRSpecs.length; i++) {
    const spec = acmePRSpecs[i];
    let pr = await prisma.pullRequest.findFirst({
      where: { organizationId: acmeOrg.id, title: spec.title },
    });

    if (!pr) {
      pr = await prisma.pullRequest.create({
        data: {
          organizationId: acmeOrg.id,
          title: spec.title,
          description: spec.desc,
          status: spec.status,
          createdBy: acmeAdminId,
          mergedBy: spec.status === PullRequestStatus.MERGED ? acmeReviewerId : null,
          requiredApprovals: 1,
        },
      });

      await prisma.pullRequestVersion.create({
        data: {
          pullRequestId: pr.id,
          versionNumber: 1,
          title: `Initial Diff Payload for ${spec.title}`,
          description: `Initial commit changes for PR #${i + 101}`,
          createdBy: acmeAdminId,
        },
      });

      await prisma.pullRequestReviewer.create({
        data: {
          pullRequestId: pr.id,
          reviewerId: acmeReviewerId,
        },
      });

      if (spec.status === PullRequestStatus.APPROVED || spec.status === PullRequestStatus.MERGED) {
        await prisma.reviewDecision.create({
          data: {
            pullRequestId: pr.id,
            reviewerId: acmeReviewerId,
            decision: ReviewDecisionType.APPROVED,
            comment: 'Code changes verified. Automated test suite and security scan passed.',
          },
        });
      }
    }
  }

  console.info('  ✔ Acme: 3 PR Reviews created for Reviewer');

  // 7. Seed Nova Pull Requests (2 PR Reviews)
  const novaPRSpecs = [
    {
      title: 'PR #201: Encrypted Medical Log Exporter Subsystem',
      desc: 'Implements AES-256 GCM payload encryption for exported health record streams.',
      status: PullRequestStatus.UNDER_REVIEW,
    },
    {
      title: 'PR #202: Telehealth Session Token Refresh Logic',
      desc: 'Updates JWT token rotation handler for zero-downtime telehealth re-authentication.',
      status: PullRequestStatus.APPROVED,
    },
  ];

  for (let i = 0; i < novaPRSpecs.length; i++) {
    const spec = novaPRSpecs[i];
    let pr = await prisma.pullRequest.findFirst({
      where: { organizationId: novaOrg.id, title: spec.title },
    });

    if (!pr) {
      pr = await prisma.pullRequest.create({
        data: {
          organizationId: novaOrg.id,
          title: spec.title,
          description: spec.desc,
          status: spec.status,
          createdBy: novaAdminId,
          requiredApprovals: 1,
        },
      });

      await prisma.pullRequestReviewer.create({
        data: {
          pullRequestId: pr.id,
          reviewerId: novaReviewerId,
        },
      });

      if (spec.status === PullRequestStatus.APPROVED) {
        await prisma.reviewDecision.create({
          data: {
            pullRequestId: pr.id,
            reviewerId: novaReviewerId,
            decision: ReviewDecisionType.APPROVED,
            comment: 'Medical compliance code check passed.',
          },
        });
      }
    }
  }

  console.info('  ✔ Nova: 2 PR Reviews created for Reviewer');

  // 8. Cross-Organization Connection & Resource Sharing (Acme <-> Nova)
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

  // Share Acme Ticket #1 with Nova Healthcare so Guest (guest@nova.demo) can see shared resources
  const sharedTicket = seededAcmeTickets[0];
  if (sharedTicket) {
    const existingShare = await prisma.sharedResource.findFirst({
      where: { resourceId: sharedTicket.id, sharedWithOrganizationId: novaOrg.id },
    });

    if (!existingShare) {
      await prisma.sharedResource.create({
        data: {
          resourceType: SharedResourceType.TICKET,
          resourceId: sharedTicket.id,
          ownerOrganizationId: acmeOrg.id,
          sharedWithOrganizationId: novaOrg.id,
          permission: SharePermission.READ,
          sharedBy: acmeAdminId,
        },
      });
    }
  }

  console.info('  ✔ Cross-Org: Connection & Shared Resource created (Acme <-> Nova)');

  // 9. AI Digest (1 Completed Digest for Acme & Nova)
  let acmeDigest = await prisma.digest.findFirst({
    where: { organizationId: acmeOrg.id, userId: acmeAdminId },
  });
  if (!acmeDigest) {
    await prisma.digest.create({
      data: {
        organizationId: acmeOrg.id,
        userId: acmeAdminId,
        title: 'Acme Executive Operational Briefing',
        summary:
          'Acme Technologies Operational Briefing: 9 active tickets logged with 100% SLA compliance. PR #103 successfully merged. System health remains optimal at 99.98% uptime.',
        status: DigestStatus.READY,
        modelUsed: 'gemini-2.5-flash',
        tokenUsage: 450,
      },
    });
  }

  let novaDigest = await prisma.digest.findFirst({
    where: { organizationId: novaOrg.id, userId: novaAdminId },
  });
  if (!novaDigest) {
    await prisma.digest.create({
      data: {
        organizationId: novaOrg.id,
        userId: novaAdminId,
        title: 'Nova Healthcare Compliance Briefing',
        summary:
          'Nova Healthcare Compliance Briefing: 6 medical tickets active with 1 critical HIPAA export task in progress. PR #202 approved by reviewer. Zero security anomalies detected.',
        status: DigestStatus.READY,
        modelUsed: 'gemini-2.5-flash',
        tokenUsage: 510,
      },
    });
  }

  console.info('  ✔ AI Digest: Generated completed Executive Briefing for Acme & Nova');

  // 10. Notifications (Invitation, Assignment, Comment, Review, Approval, AI Digest)
  const notificationSpecs = [
    {
      userId: acmeAdminId,
      orgId: acmeOrg.id,
      type: NotificationType.SYSTEM,
      title: 'Organization Created',
      msg: 'Welcome to Acme Technologies Workspace platform.',
    },
    {
      userId: acmeSupport1Id,
      orgId: acmeOrg.id,
      type: NotificationType.TICKET_ASSIGNED,
      title: 'Ticket Assigned',
      msg: 'Ticket #1: Billing Module Webhook Retry Failure assigned to you.',
    },
    {
      userId: acmeReviewerId,
      orgId: acmeOrg.id,
      type: NotificationType.REVIEW_ASSIGNED,
      title: 'PR Review Assigned',
      msg: 'PR #101: Implement Fine-Grained Permission Override Engine assigned for review.',
    },
    {
      userId: acmeAdminId,
      orgId: acmeOrg.id,
      type: NotificationType.REVIEW_APPROVED,
      title: 'PR Review Approved',
      msg: 'PR #101 approved by Reviewer Priya Sharma.',
    },
    {
      userId: acmeAdminId,
      orgId: acmeOrg.id,
      type: NotificationType.AI_DIGEST,
      title: 'AI Executive Briefing Ready',
      msg: 'Your daily Gemini AI operational digest is ready for review.',
    },
    {
      userId: novaGuestId,
      orgId: novaOrg.id,
      type: NotificationType.SHARE_RECEIVED,
      title: 'Shared Resource Access Granted',
      msg: 'Acme Technologies shared Billing Module Ticket with Nova Healthcare.',
    },
  ];

  for (const notif of notificationSpecs) {
    const existing = await prisma.notification.findFirst({
      where: { userId: notif.userId, title: notif.title },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: notif.userId,
          organizationId: notif.orgId,
          type: notif.type,
          title: notif.title,
          message: notif.msg,
          isRead: false,
        },
      });
    }
  }

  console.info(
    '  ✔ Notifications: Created Invitation, Assignment, Comment, Review, Approval & AI Digest alerts'
  );

  // 11. Audit Logs (Organization Created, User Created, Login, Logout, Ticket Created, Review Approved, Role Changed, Invitation Sent, Share Resource)
  const auditSpecs = [
    {
      actorId: superAdminId,
      email: 'superadmin@platform.demo',
      role: 'SUPER_ADMIN',
      mod: 'ORGANIZATION',
      act: 'ORGANIZATION_CREATE',
      type: 'Organization',
      id: acmeOrg.id,
    },
    {
      actorId: acmeAdminId,
      email: 'admin@acme.demo',
      role: 'ADMIN',
      mod: 'USER_MANAGEMENT',
      act: 'USER_CREATE',
      type: 'User',
      id: acmeSupport1Id,
    },
    {
      actorId: acmeSupport1Id,
      email: 'support1@acme.demo',
      role: 'SUPPORT_AGENT',
      mod: 'AUTHENTICATION',
      act: 'USER_LOGIN',
      type: 'Session',
      id: 'session-login-1',
    },
    {
      actorId: acmeSupport1Id,
      email: 'support1@acme.demo',
      role: 'SUPPORT_AGENT',
      mod: 'AUTHENTICATION',
      act: 'USER_LOGOUT',
      type: 'Session',
      id: 'session-logout-1',
    },
    {
      actorId: acmeAdminId,
      email: 'admin@acme.demo',
      role: 'ADMIN',
      mod: 'SUPPORT_HUB',
      act: 'TICKET_CREATED',
      type: 'Ticket',
      id: seededAcmeTickets[0]?.id || 'ticket-1',
    },
    {
      actorId: acmeReviewerId,
      email: 'reviewer@acme.demo',
      role: 'REVIEWER',
      mod: 'REVIEW_CONSOLE',
      act: 'REVIEW_APPROVED',
      type: 'PullRequest',
      id: 'pr-101',
    },
    {
      actorId: acmeAdminId,
      email: 'admin@acme.demo',
      role: 'ADMIN',
      mod: 'RBAC',
      act: 'ROLE_CHANGED',
      type: 'OrganizationMember',
      id: acmeSupport1Id,
    },
    {
      actorId: acmeAdminId,
      email: 'admin@acme.demo',
      role: 'ADMIN',
      mod: 'ORGANIZATION',
      act: 'INVITATION_SENT',
      type: 'Invitation',
      id: 'invitation-1',
    },
    {
      actorId: acmeAdminId,
      email: 'admin@acme.demo',
      role: 'ADMIN',
      mod: 'COLLABORATION',
      act: 'SHARE_RESOURCE',
      type: 'SharedResource',
      id: 'shared-1',
    },
  ];

  for (const audit of auditSpecs) {
    const existing = await prisma.auditLog.findFirst({
      where: { actorEmail: audit.email, action: audit.act },
    });
    if (!existing) {
      await prisma.auditLog.create({
        data: {
          organizationId: acmeOrg.id,
          actorId: audit.actorId,
          actorEmail: audit.email,
          actorRole: audit.role,
          module: audit.mod,
          action: audit.act,
          entityType: audit.type,
          entityId: audit.id,
          previousState: { status: 'INITIAL' },
          newState: { status: 'ACTIVE' },
          ipAddress: '192.168.1.10',
          userAgent: 'Mozilla/5.0 Enterprise-Agent',
        },
      });
    }
  }

  console.info('  ✔ Audit Logs: Created realistic audit history');
  console.info('🎉 Idempotent Demo Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
