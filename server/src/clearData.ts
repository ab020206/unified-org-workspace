import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDataKeepSuperAdmin() {
  console.log('🧹 Clearing all database data except Platform Super Admin...');

  try {
    // 1. Delete dependent leaf records
    await prisma.auditMetadata.deleteMany();
    await prisma.auditLog.deleteMany();

    await prisma.ticketComment.deleteMany();
    await prisma.ticketAttachment.deleteMany();
    await prisma.ticketActivity.deleteMany();
    await prisma.ticket.deleteMany();

    await prisma.reviewComment.deleteMany();
    await prisma.reviewDecision.deleteMany();
    await prisma.pullRequestReviewer.deleteMany();
    await prisma.pullRequestVersion.deleteMany();
    await prisma.pullRequestActivity.deleteMany();
    await prisma.pullRequest.deleteMany();

    await prisma.sharedAccess.deleteMany();
    await prisma.sharedResource.deleteMany();
    await prisma.organizationConnection.deleteMany();

    await prisma.digest.deleteMany();
    await prisma.notification.deleteMany();

    await prisma.featureFlag.deleteMany();
    await prisma.permissionOverride.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.invitation.deleteMany();

    await prisma.organization.deleteMany();

    // 2. Clear sessions and refresh tokens for non-superadmin users
    const superAdminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { isPlatformUser: true },
          { email: 'superadmin@platform.demo' }
        ]
      }
    });

    if (superAdminUser) {
      console.log(`✅ Preserving Platform Super Admin: ${superAdminUser.email} (${superAdminUser.id})`);

      await prisma.session.deleteMany({
        where: { userId: { not: superAdminUser.id } }
      });
      await prisma.refreshToken.deleteMany({
        where: { userId: { not: superAdminUser.id } }
      });

      // Delete all non-superadmin users
      const deleteResult = await prisma.user.deleteMany({
        where: { id: { not: superAdminUser.id } }
      });
      console.log(`🗑️ Deleted ${deleteResult.count} non-superadmin user accounts.`);
    } else {
      console.warn('⚠️ No Super Admin found! Clearing all user sessions & tokens.');
      await prisma.session.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();
    }

    console.log('✨ All database tables cleared successfully (Platform Super Admin preserved).');
  } catch (error) {
    console.error('❌ Error clearing database data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDataKeepSuperAdmin();
