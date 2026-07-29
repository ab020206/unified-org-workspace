import { prisma } from '../config/prisma';
import { FeatureFlagKey } from '@workspace/shared-types';

export class FeatureFlagRepository {
  public async findByKey(key: string, organizationId?: string) {
    // Search org-specific override first if orgId provided
    if (organizationId) {
      const orgFlag = await prisma.featureFlag.findFirst({
        where: { key, organizationId },
      });
      if (orgFlag) return orgFlag;
    }

    // Fall back to global flag (where organizationId is null)
    return prisma.featureFlag.findFirst({
      where: { key, organizationId: null },
    });
  }

  public async listAll(organizationId?: string) {
    const globalFlags = await prisma.featureFlag.findMany({
      where: { organizationId: null },
      orderBy: { key: 'asc' },
    });

    let orgFlags: typeof globalFlags = [];
    if (organizationId) {
      orgFlags = await prisma.featureFlag.findMany({
        where: { organizationId },
      });
    }

    return { globalFlags, orgFlags };
  }

  public async upsertFlag(
    key: string,
    enabled: boolean,
    organizationId?: string | null,
    description?: string
  ) {
    const existing = await prisma.featureFlag.findFirst({
      where: { key, organizationId: organizationId ?? null },
    });

    if (existing) {
      return prisma.featureFlag.update({
        where: { id: existing.id },
        data: { enabled, description: description ?? existing.description },
      });
    }

    return prisma.featureFlag.create({
      data: {
        key,
        enabled,
        organizationId: organizationId ?? null,
        description: description || `Feature flag for ${key}`,
      },
    });
  }

  public async seedDefaultFlags() {
    const defaults = [
      {
        key: FeatureFlagKey.AI_DIGEST,
        description: 'Enable AI Executive Digest generation',
        enabled: true,
      },
      {
        key: FeatureFlagKey.CROSS_ORG_SHARING,
        description: 'Enable cross-organization resource sharing',
        enabled: true,
      },
      {
        key: FeatureFlagKey.REVIEW_CONSOLE,
        description: 'Enable PR review console & workflow',
        enabled: true,
      },
      {
        key: FeatureFlagKey.NOTIFICATIONS,
        description: 'Enable real-time notification engine',
        enabled: true,
      },
      {
        key: FeatureFlagKey.ADVANCED_ANALYTICS,
        description: 'Enable advanced analytics reporting',
        enabled: false,
      },
    ];

    for (const flag of defaults) {
      const existing = await prisma.featureFlag.findFirst({
        where: { key: flag.key, organizationId: null },
      });

      if (!existing) {
        await prisma.featureFlag.create({
          data: {
            key: flag.key,
            description: flag.description,
            enabled: flag.enabled,
            organizationId: null,
          },
        });
      }
    }
  }
}
