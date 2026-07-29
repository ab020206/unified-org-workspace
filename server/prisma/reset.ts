import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.info('🧹 Resetting Demo Environment (Preserving Platform Super Admin)...');

  // Delete all relational records in dependency order
  await prisma.auditMetadata.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.digest.deleteMany({});
  await prisma.sharedAccess.deleteMany({});
  await prisma.sharedResource.deleteMany({});
  await prisma.organizationConnection.deleteMany({});
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
  await prisma.invitation.deleteMany({});
  await prisma.permissionOverride.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.featureFlag.deleteMany({});
  await prisma.gitHubIntegration.deleteMany({});
  await prisma.anomalyAlert.deleteMany({});
  await prisma.pushSubscription.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.organization.deleteMany({});

  // Delete all users EXCEPT superadmin@platform.demo
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'superadmin@platform.demo' },
  });

  if (superAdmin) {
    await prisma.user.deleteMany({
      where: {
        id: { not: superAdmin.id },
      },
    });
    console.info('  ✔ Preserved Platform Super Admin (superadmin@platform.demo)');
  } else {
    await prisma.user.deleteMany({});
  }

  console.info('✨ Demo data reset completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Reset error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
