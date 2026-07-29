import { prisma } from '../config/prisma';
import { PermissionOverride } from '@prisma/client';

export class PermissionRepository {
  public async getOverridesForMember(memberId: string): Promise<PermissionOverride[]> {
    return prisma.permissionOverride.findMany({
      where: { memberId },
    });
  }

  public async setOverride(
    memberId: string,
    permission: string,
    allowed: boolean
  ): Promise<PermissionOverride> {
    return prisma.permissionOverride.upsert({
      where: {
        memberId_permission: {
          memberId,
          permission,
        },
      },
      create: {
        memberId,
        permission,
        allowed,
      },
      update: {
        allowed,
      },
    });
  }
}
