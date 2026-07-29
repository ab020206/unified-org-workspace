import { Role, Permission, DEFAULT_ROLE_PERMISSIONS } from '@workspace/shared-types';
import { PermissionRepository } from '../repositories/permission.repository';

export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository = new PermissionRepository()
  ) {}

  public async getEffectivePermissions(memberId: string, role: Role): Promise<Permission[]> {
    // 1. Super Admin bypass
    if (role === Role.SUPER_ADMIN) {
      return Object.values(Permission);
    }

    // 2. Load role default permissions
    const defaultPermissions = new Set<Permission>(DEFAULT_ROLE_PERMISSIONS[role] || []);

    // 3. Load DB overrides for member
    const overrides = await this.permissionRepository.getOverridesForMember(memberId);

    for (const override of overrides) {
      const perm = override.permission as Permission;
      if (override.allowed) {
        defaultPermissions.add(perm);
      } else {
        defaultPermissions.delete(perm);
      }
    }

    return Array.from(defaultPermissions);
  }

  public hasPermission(
    effectivePermissions: Permission[],
    required: Permission | Permission[]
  ): boolean {
    const requiredSet = Array.isArray(required) ? required : [required];
    return requiredSet.every((perm) => effectivePermissions.includes(perm));
  }
}
