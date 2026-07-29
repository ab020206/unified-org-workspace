import assert from 'assert';
import { PermissionService } from '../../src/services/permission.service';
import { Role, Permission } from '@workspace/shared-types';

export async function runPermissionServiceUnitTests() {
  console.log('    • Running PermissionService Unit Tests...');
  const permissionService = new PermissionService();

  // 1. Role Admin default permissions
  const adminPermissions = await permissionService.getEffectivePermissions(
    'dummy-member-id',
    Role.ADMIN
  );
  assert.ok(adminPermissions.includes(Permission.ORG_UPDATE));
  assert.ok(adminPermissions.includes(Permission.TICKET_READ));
  assert.ok(adminPermissions.includes(Permission.REVIEW_APPROVE));

  // 2. Role Guest permissions
  const guestPermissions = await permissionService.getEffectivePermissions(
    'dummy-guest-id',
    Role.GUEST
  );
  assert.strictEqual(guestPermissions.includes(Permission.ORG_UPDATE), false);
  assert.ok(guestPermissions.includes(Permission.TICKET_READ));

  // 3. hasPermission checks
  assert.strictEqual(
    permissionService.hasPermission(adminPermissions, Permission.ORG_UPDATE),
    true
  );
  assert.strictEqual(
    permissionService.hasPermission(guestPermissions, Permission.ORG_DELETE),
    false
  );

  console.log('      ✔ PermissionService unit tests passed');
}
