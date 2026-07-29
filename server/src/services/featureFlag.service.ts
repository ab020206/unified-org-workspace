import { FeatureFlagRepository } from '../repositories/featureFlag.repository';
import { FeatureFlagKey, FeatureFlagPayload } from '@workspace/shared-types';
import { auditService } from './audit.service';
import { logger } from '../utils/logger';

export class FeatureFlagService {
  constructor(
    private readonly featureFlagRepository: FeatureFlagRepository = new FeatureFlagRepository()
  ) {}

  public async isEnabled(key: FeatureFlagKey | string, organizationId?: string): Promise<boolean> {
    const flag = await this.featureFlagRepository.findByKey(key, organizationId);
    if (!flag) {
      // Default fallback strategy: ADVANCED_ANALYTICS disabled by default, others enabled
      if (key === FeatureFlagKey.ADVANCED_ANALYTICS) return false;
      return true;
    }
    return flag.enabled;
  }

  public async getFeatureFlags(organizationId?: string): Promise<{
    flags: Record<string, boolean>;
    details: FeatureFlagPayload[];
  }> {
    await this.featureFlagRepository.seedDefaultFlags();
    const { globalFlags, orgFlags } = await this.featureFlagRepository.listAll(organizationId);

    const flagMap: Record<string, boolean> = {};
    const details: FeatureFlagPayload[] = [];

    // First populate global flags
    for (const flag of globalFlags) {
      flagMap[flag.key] = flag.enabled;
      details.push({
        id: flag.id,
        key: flag.key,
        description: flag.description,
        enabled: flag.enabled,
        organizationId: flag.organizationId,
        createdAt: flag.createdAt.toISOString(),
        updatedAt: flag.updatedAt.toISOString(),
      });
    }

    // Override with org-specific flags if present
    for (const flag of orgFlags) {
      flagMap[flag.key] = flag.enabled;
      const index = details.findIndex((d) => d.key === flag.key && !d.organizationId);
      const formatted: FeatureFlagPayload = {
        id: flag.id,
        key: flag.key,
        description: flag.description,
        enabled: flag.enabled,
        organizationId: flag.organizationId,
        createdAt: flag.createdAt.toISOString(),
        updatedAt: flag.updatedAt.toISOString(),
      };
      if (index !== -1) {
        details[index] = formatted;
      } else {
        details.push(formatted);
      }
    }

    return { flags: flagMap, details };
  }

  public async toggleFlag(
    key: string,
    enabled: boolean,
    organizationId?: string | null,
    actorContext?: { actorId: string; actorEmail: string; actorRole: string }
  ): Promise<FeatureFlagPayload> {
    const updated = await this.featureFlagRepository.upsertFlag(key, enabled, organizationId);

    logger.info(
      { key, enabled, organizationId, actorId: actorContext?.actorId },
      'Feature flag toggled'
    );

    if (actorContext) {
      await auditService.log({
        organizationId: organizationId || undefined,
        actorId: actorContext.actorId,
        actorEmail: actorContext.actorEmail,
        actorRole: actorContext.actorRole,
        module: 'SECURITY',
        action: 'FEATURE_FLAG_UPDATE',
        entityType: 'FEATURE_FLAG',
        entityId: updated.id,
        newState: { key, enabled, organizationId },
      });
    }

    return {
      id: updated.id,
      key: updated.key,
      description: updated.description,
      enabled: updated.enabled,
      organizationId: updated.organizationId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}

export const featureFlagService = new FeatureFlagService();
