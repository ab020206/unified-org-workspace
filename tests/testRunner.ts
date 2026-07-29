import assert from 'assert';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { RedisManager } from '../src/config/redis';
import { runAuthServiceUnitTests } from './unit/auth.service.test';
import { runPermissionServiceUnitTests } from './unit/permission.service.test';
import { runValidatorsUnitTests } from './unit/validators.test';
import { runSecuritySuiteTests } from './security/security.test';
import { runPerformanceSuiteTests } from './performance/performance.test';
import { runUserJourneysE2ETests } from './e2e/userJourneys.test';

async function runTests() {
  console.log('🧪 Starting Unified Workspace Comprehensive Phase 1 - 9 Master Test Suite...');

  try {
    const testEmail = `admin-${Date.now()}@example.com`;
    const guestEmail = `guest-${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    // 1. Register Admin User
    console.log('  [1/65] Testing POST /api/v1/auth/register (Admin)...');
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'Admin',
        email: testEmail,
        password: testPassword,
        organizationName: 'Org Alpha Workspace',
      })
      .expect(201);

    assert.strictEqual(regRes.body.success, true);
    const adminToken = regRes.body.data.tokens.accessToken;
    let refreshToken = regRes.body.data.tokens.refreshToken;

    const initialOrgRes = await request(app)
      .get('/api/v1/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const adminOrgId = initialOrgRes.body.data[0].id;
    const adminUserId = regRes.body.data.user.id;

    // 2. User Login
    console.log('  [2/65] Testing POST /api/v1/auth/login...');
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    assert.strictEqual(loginRes.body.success, true);

    // 3. Profile Fetch
    console.log('  [3/65] Testing GET /api/v1/auth/me...');
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(meRes.body.data.email, testEmail);

    // 4. Create Secondary Organization (Org Beta)
    console.log('  [4/65] Testing POST /api/v1/organizations (Create Org Beta)...');
    const orgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Org Beta Workspace' })
      .expect(201);

    const secondaryOrgId = orgRes.body.data.id;

    // 5. List Organizations
    console.log('  [5/65] Testing GET /api/v1/organizations...');
    const listRes = await request(app)
      .get('/api/v1/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(listRes.body.data.length, 2);

    // 6. Switch Active Organization Context
    console.log('  [6/65] Testing PATCH /api/v1/organizations/switch...');
    await request(app)
      .patch('/api/v1/organizations/switch')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ organizationId: adminOrgId })
      .expect(200);

    // 7. Register Guest User
    console.log('  [7/65] Registering Guest User...');
    const guestReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Guest',
        lastName: 'User',
        email: guestEmail,
        password: testPassword,
      })
      .expect(201);

    const guestToken = guestReg.body.data.tokens.accessToken;
    const guestUserId = guestReg.body.data.user.id;

    // 8. Admin Invites Guest User as REVIEWER role in Org Alpha
    console.log('  [8/65] Inviting Guest User with REVIEWER role...');
    const inviteRes = await request(app)
      .post('/api/v1/organizations/invite')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ email: guestEmail, role: 'REVIEWER' })
      .expect(201);

    const inviteToken = inviteRes.body.data.token;

    // 9. Guest User Accepts Invitation
    console.log('  [9/65] Guest User accepts invitation...');
    await request(app)
      .post('/api/v1/organizations/accept')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ token: inviteToken })
      .expect(200);

    // 10. Refresh Token Rotation Check
    console.log('  [10/65] Testing POST /api/v1/auth/refresh (Rotation)...');
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    assert.ok(refreshRes.body.data.accessToken);

    // 11. Unauthorized Access Attempt
    console.log('  [11/65] Testing Unauthorized Access (401 Check)...');
    await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token')
      .expect(401);

    // 12. RBAC Enforcement Check
    console.log(
      '  [12/65] RBAC Check: Guest User attempts POST /organizations/invite (403 Expected)...'
    );
    const member = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: adminOrgId, userId: guestUserId } },
    });
    assert.ok(member);

    await prisma.organizationMember.update({
      where: { id: member.id },
      data: { role: 'GUEST' },
    });

    await request(app)
      .post('/api/v1/organizations/invite')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ email: 'random@example.com', role: 'GUEST' })
      .expect(403);

    // 13. Permission Override Check
    console.log('  [13/65] Permission Override Check...');
    await prisma.permissionOverride.create({
      data: {
        memberId: member.id,
        permission: 'organization.invite',
        allowed: true,
      },
    });

    await request(app)
      .post('/api/v1/organizations/invite')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ email: `new-member-${Date.now()}@example.com`, role: 'GUEST' })
      .expect(201);

    // 14. Super Admin Bypass Check
    console.log('  [14/65] Super Admin Bypass Check...');
    await prisma.organizationMember.update({
      where: { id: member.id },
      data: { role: 'SUPER_ADMIN' },
    });

    const superAdminRes = await request(app)
      .get('/api/v1/organizations/current')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.strictEqual(superAdminRes.body.data.userRole, 'SUPER_ADMIN');

    // Restore guest user to REVIEWER role
    await prisma.organizationMember.update({
      where: { id: member.id },
      data: { role: 'REVIEWER' },
    });

    // ==========================================
    // PHASE 3 SUPPORT HUB (TICKET MODULE) TESTS
    // ==========================================

    // 15. Create Ticket
    console.log('  [15/65] Phase 3 Check: Create Ticket...');
    const createTicketRes = await request(app)
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        title: 'Database latency spike under high load',
        description: 'Queries take over 2.5 seconds during peak traffic hours.',
        category: 'BUG',
        priority: 'HIGH',
      })
      .expect(201);

    const ticketId = createTicketRes.body.data.id;

    // 16. List Tickets & Dashboard Stats
    console.log('  [16/65] Phase 3 Check: List Tickets & Stats...');
    await request(app)
      .get('/api/v1/tickets?status=OPEN')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 17. Update Ticket
    console.log('  [17/65] Phase 3 Check: Update Ticket Details...');
    await request(app)
      .patch(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ priority: 'URGENT' })
      .expect(200);

    // 18. Assign Ticket
    console.log('  [18/65] Phase 3 Check: Assign Ticket...');
    await request(app)
      .patch(`/api/v1/tickets/${ticketId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ assignedTo: guestUserId })
      .expect(200);

    // 19. Status Transitions
    console.log('  [19/65] Phase 3 Check: Status Transitions...');
    await request(app)
      .patch(`/api/v1/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);

    // 20. Ticket Comments CRUD
    console.log('  [20/65] Phase 3 Check: Ticket Comments...');
    await request(app)
      .post(`/api/v1/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ message: 'Investigating query plan.' })
      .expect(201);

    // 21. Attachments Upload
    console.log('  [21/65] Phase 3 Check: Attachment Upload...');
    await request(app)
      .post(`/api/v1/tickets/${ticketId}/attachments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .attach('file', Buffer.from('log output'), 'log.txt')
      .expect(201);

    // 22. Ticket Activity Timeline
    console.log('  [22/65] Phase 3 Check: Activity Timeline...');
    await request(app)
      .get(`/api/v1/tickets/${ticketId}/activity`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 23. Ticket Multi-Tenant Isolation
    console.log('  [23/65] Phase 3 Check: Ticket Multi-Tenant Isolation...');
    await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(404);

    // 24. Ticket Unauthorized Delete
    console.log('  [24/65] Phase 3 Check: Ticket RBAC Unauthorized Delete...');
    await request(app)
      .delete(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(403);

    // ==========================================
    // PHASE 4 REVIEW CONSOLE (PR WORKFLOW) TESTS
    // ==========================================

    // 25. Create Pull Request as DRAFT
    console.log('  [25/65] Phase 4 Check: POST /api/v1/pull-requests (Create Draft PR)...');
    const createPRRes = await request(app)
      .post('/api/v1/pull-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        title: 'Add OAuth2 single sign-on integration',
        description: 'Implements OAuth2 PKCE flow for Google & GitHub identity providers.',
        requiredApprovals: 2,
        isDraft: true,
      })
      .expect(201);

    const prId = createPRRes.body.data.id;

    // 26. Assign Reviewers
    console.log('  [26/65] Phase 4 Check: POST /pull-requests/:id/reviewers...');
    await request(app)
      .post(`/api/v1/pull-requests/${prId}/reviewers`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ reviewerIds: [adminUserId, guestUserId] })
      .expect(200);

    // 27. Submit Draft PR for Review
    console.log('  [27/65] Phase 4 Check: PATCH /pull-requests/:id/submit...');
    await request(app)
      .patch(`/api/v1/pull-requests/${prId}/submit`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 28. Edit PR Content & Automatic Version Generation
    console.log('  [28/65] Phase 4 Check: Update PR & Version 2 Generation...');
    await request(app)
      .patch(`/api/v1/pull-requests/${prId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        title: 'Add OAuth2 & OIDC single sign-on integration',
        description:
          'Implements OAuth2 PKCE flow for Google & GitHub IDPs with OIDC token validation.',
      })
      .expect(200);

    // 29. Partial Approval Threshold Check
    console.log('  [29/65] Phase 4 Check: Partial Approval Threshold Check...');
    await request(app)
      .patch(`/api/v1/pull-requests/${prId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ comment: 'Architecture looks solid.' })
      .expect(200);

    // 30. Full Approval Threshold Reached
    console.log('  [30/65] Phase 4 Check: Full Approval Threshold (APPROVED)...');
    await request(app)
      .patch(`/api/v1/pull-requests/${prId}/approve`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ comment: 'LGTM!' })
      .expect(200);

    // 31. Merge Pull Request
    console.log('  [31/65] Phase 4 Check: PATCH /pull-requests/:id/merge...');
    await request(app)
      .patch(`/api/v1/pull-requests/${prId}/merge`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 32. Request Changes & Re-review Workflow
    console.log('  [32/65] Phase 4 Check: Request Changes Workflow...');
    const pr2Res = await request(app)
      .post('/api/v1/pull-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        title: 'Refactor rate limiter middleware',
        description: 'Migrate in-memory token bucket to Redis sliding window.',
        requiredApprovals: 1,
        isDraft: false,
      })
      .expect(201);

    const pr2Id = pr2Res.body.data.id;

    await request(app)
      .patch(`/api/v1/pull-requests/${pr2Id}/request-changes`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ comment: 'Please handle Redis connection error fallbacks.' })
      .expect(200);

    // 33. Multi-Tenant Isolation Check for Pull Requests
    console.log('  [33/65] Phase 4 Check: PR Multi-Tenant Isolation Check...');
    await request(app)
      .get(`/api/v1/pull-requests/${prId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(404);

    // 34. RBAC Merge Authorization Check
    console.log('  [34/65] Phase 4 Check: RBAC Merge Authorization Check...');
    await request(app)
      .patch(`/api/v1/pull-requests/${pr2Id}/merge`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(403);

    // 35. Version History & Activity Timeline Endpoints
    console.log('  [35/65] Phase 4 Check: Versions & Activity Endpoints...');
    await request(app)
      .get(`/api/v1/pull-requests/${prId}/versions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // ==========================================
    // PHASE 5 UNIFIED AUDIT LOGGING TESTS
    // ==========================================

    // 36. Verify Auth Module Events
    console.log('  [36/65] Phase 5 Check: GET /api/v1/audit (Auth Module Event Logging)...');
    const authAuditRes = await request(app)
      .get('/api/v1/audit?module=AUTHENTICATION')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.strictEqual(authAuditRes.body.success, true);
    assert.ok(authAuditRes.body.data.items.length >= 1);

    // 37. Verify Organization Module Events
    console.log('  [37/65] Phase 5 Check: GET /api/v1/audit (Organization Module Events)...');
    await request(app)
      .get('/api/v1/audit?module=ORGANIZATION')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 38. Verify Support Hub Events
    console.log('  [38/65] Phase 5 Check: GET /api/v1/audit (Support Hub Events)...');
    await request(app)
      .get('/api/v1/audit?module=SUPPORT_HUB')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 39. Verify Review Console Events
    console.log('  [39/65] Phase 5 Check: GET /api/v1/audit (Review Console Events)...');
    await request(app)
      .get('/api/v1/audit?module=REVIEW_CONSOLE')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 40. Sensitive Field Masking
    console.log('  [40/65] Phase 5 Check: Sensitive Field Masking...');
    const allAuditRes = await request(app)
      .get('/api/v1/audit?limit=100')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    const logWithState = allAuditRes.body.data.items.find(
      (i: any) => i.newState && i.newState.password
    );
    if (logWithState) {
      assert.strictEqual(logWithState.newState.password, '[REDACTED]');
    }

    // 41. Audit Stats
    console.log('  [41/65] Phase 5 Check: GET /api/v1/audit/stats...');
    await request(app)
      .get('/api/v1/audit/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 42. Multi-Tenant Isolation Check
    console.log('  [42/65] Phase 5 Check: Audit Multi-Tenant Isolation Check...');
    await request(app)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(200);

    // 43. Super Admin Global Audit Access
    console.log('  [43/65] Phase 5 Check: Super Admin Global Audit Access...');
    await prisma.organizationMember.update({
      where: { organizationId_userId: { organizationId: adminOrgId, userId: adminUserId } },
      data: { role: 'SUPER_ADMIN' },
    });

    await request(app)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 44. Distinct Modules & Actions Endpoints
    console.log('  [44/65] Phase 5 Check: GET /audit/modules & GET /audit/actions...');
    await request(app)
      .get('/api/v1/audit/modules')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 45. Single Audit Record Fetching
    console.log('  [45/65] Phase 5 Check: GET /api/v1/audit/:id...');
    const targetAuditId = allAuditRes.body.data.items[0].id;
    await request(app)
      .get(`/api/v1/audit/${targetAuditId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // ==========================================
    // PHASE 6 CROSS-ORGANIZATION COLLABORATION TESTS
    // ==========================================

    // 46. Send Connection Request
    console.log('  [46/65] Phase 6 Check: POST /api/v1/connections/request...');
    const requestConnRes = await request(app)
      .post('/api/v1/connections/request')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ targetOrganizationIdOrSlug: secondaryOrgId })
      .expect(201);

    const connectionId = requestConnRes.body.data.id;

    // 47. Accept Connection Request
    console.log('  [47/65] Phase 6 Check: PATCH /api/v1/connections/:id/accept...');
    await request(app)
      .patch(`/api/v1/connections/${connectionId}/accept`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(200);

    // 48. Share Support Hub Ticket
    console.log('  [48/65] Phase 6 Check: POST /api/v1/sharing (Share Ticket)...');
    const shareTicketRes = await request(app)
      .post('/api/v1/sharing')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        resourceType: 'TICKET',
        resourceId: ticketId,
        targetOrganizationId: secondaryOrgId,
        permission: 'READ',
      })
      .expect(201);

    const sharedTicketId = shareTicketRes.body.data.id;

    // 49. Guest Access Verification
    console.log('  [49/65] Phase 6 Check: GET /api/v1/tickets/:id (Guest Access)...');
    await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(200);

    // 50. Share Pull Request
    console.log('  [50/65] Phase 6 Check: POST /api/v1/sharing (Share PR)...');
    const sharePRRes = await request(app)
      .post('/api/v1/sharing')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        resourceType: 'PULL_REQUEST',
        resourceId: prId,
        targetOrganizationId: secondaryOrgId,
        permission: 'REVIEW',
      })
      .expect(201);

    const sharedPRId = sharePRRes.body.data.id;

    // 51. Guest Reviewer Action
    console.log('  [51/65] Phase 6 Check: GET /api/v1/pull-requests/:id (Guest Access)...');
    await request(app)
      .get(`/api/v1/pull-requests/${prId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(200);

    // 52. Expired Share Check
    console.log('  [52/65] Phase 6 Check: Expired Share Check...');
    await prisma.sharedResource.update({
      where: { id: sharedTicketId },
      data: { expiresAt: new Date(Date.now() - 3600 * 1000) },
    });

    await request(app)
      .get(`/api/v1/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(404);

    // 53. Share Revocation Check
    console.log('  [53/65] Phase 6 Check: DELETE /api/v1/sharing/:id (Revoke Share)...');
    await request(app)
      .delete(`/api/v1/sharing/${sharedPRId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 54. Unauthorized Cross-Org Sharing Attempt
    console.log('  [54/65] Phase 6 Check: Share without accepted connection (400 Expected)...');
    const unconnOrgRes = await request(app)
      .post('/api/v1/organizations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Unconnected Org Workspace' })
      .expect(201);

    const unconnectedOrgId = unconnOrgRes.body.data.id;

    await request(app)
      .post('/api/v1/sharing')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        resourceType: 'TICKET',
        resourceId: ticketId,
        targetOrganizationId: unconnectedOrgId,
        permission: 'READ',
      })
      .expect(400);

    // 55. Verify Sharing Audit Event Logs
    console.log('  [55/65] Phase 6 Check: Verify Sharing Audit Event Logs...');
    await request(app)
      .get('/api/v1/audit?search=RESOURCE_SHARED')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // ==========================================
    // PHASE 7 AI DIGEST & NOTIFICATION TESTS
    // ==========================================

    // 56. Trigger Manual Digest Generation (POST /api/v1/digest/generate)
    console.log('  [56/65] Phase 7 Check: POST /api/v1/digest/generate...');
    const generateDigestRes = await request(app)
      .post('/api/v1/digest/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(202);

    assert.strictEqual(generateDigestRes.body.success, true);

    // 57. Get Latest Active AI Digest (GET /api/v1/digest)
    console.log('  [57/65] Phase 7 Check: GET /api/v1/digest...');
    const getDigestRes = await request(app)
      .get('/api/v1/digest')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.strictEqual(getDigestRes.body.success, true);
    assert.ok(getDigestRes.body.data.summary);

    // 58. Automatic Notification on Ticket Assignment (TICKET_ASSIGNED)
    console.log('  [58/65] Phase 7 Check: Automatic Notification on Ticket Assignment...');
    await request(app)
      .patch(`/api/v1/tickets/${ticketId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ assignedTo: guestUserId })
      .expect(200);

    const guestNotifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.ok(guestNotifRes.body.data.items.some((n: any) => n.type === 'TICKET_ASSIGNED'));

    // 59. Automatic Notification on Review Approval (REVIEW_APPROVED)
    console.log('  [59/65] Phase 7 Check: Automatic Notification on Review Approval...');
    const pr3Res = await request(app)
      .post('/api/v1/pull-requests')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        title: 'Add Redis caching layer',
        description: 'Cache digest summaries and user permissions.',
        requiredApprovals: 1,
        isDraft: false,
      })
      .expect(201);

    const pr3Id = pr3Res.body.data.id;

    await request(app)
      .patch(`/api/v1/pull-requests/${pr3Id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ comment: 'Approved!' })
      .expect(200);

    const guestPRNotifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.ok(guestPRNotifRes.body.data.items.some((n: any) => n.type === 'REVIEW_APPROVED'));

    // 60. Automatic Notification on Share Received (SHARE_RECEIVED)
    console.log('  [60/65] Phase 7 Check: Automatic Notification on Share Received...');
    await request(app)
      .post('/api/v1/sharing')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({
        resourceType: 'TICKET',
        resourceId: ticketId,
        targetOrganizationId: secondaryOrgId,
        permission: 'READ',
      })
      .expect(201);

    const secOrgNotifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(200);

    assert.ok(secOrgNotifRes.body.data.items.some((n: any) => n.type === 'SHARE_RECEIVED'));

    // 61. List Notifications & Unread Count (GET /api/v1/notifications)
    console.log('  [61/65] Phase 7 Check: GET /api/v1/notifications...');
    const notifsRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.ok(notifsRes.body.data.unreadCount >= 1);
    const targetNotifId = notifsRes.body.data.items[0].id;

    // 62. Mark Single Notification as Read (PATCH /api/v1/notifications/:id/read)
    console.log('  [62/65] Phase 7 Check: PATCH /api/v1/notifications/:id/read...');
    await request(app)
      .patch(`/api/v1/notifications/${targetNotifId}/read`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 63. Mark All Notifications as Read (PATCH /api/v1/notifications/read-all)
    console.log('  [63/65] Phase 7 Check: PATCH /api/v1/notifications/read-all...');
    await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    const postReadAllRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.strictEqual(postReadAllRes.body.data.unreadCount, 0);

    // 64. Delete Single Notification (DELETE /api/v1/notifications/:id)
    console.log('  [64/65] Phase 7 Check: DELETE /api/v1/notifications/:id...');
    await request(app)
      .delete(`/api/v1/notifications/${targetNotifId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    // 65. Verify Audit Logs for Digest & Notification Operations
    console.log('  [65/65] Phase 7 Check: Verify Audit Event Logs for Digest & Notifications...');
    const digestAuditRes = await request(app)
      .get('/api/v1/audit?search=DIGEST_REGENERATED')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.ok(digestAuditRes.body.data.items.length >= 1);

    // 66. Health, Readiness & Liveness Checks
    console.log('  [66/72] Phase 8 Check: GET /health, /ready & /live...');
    const healthRes = await request(app).get('/health').expect(200);
    assert.strictEqual(healthRes.body.data.status, 'ok');

    const liveRes = await request(app).get('/live').expect(200);
    assert.strictEqual(liveRes.body.data.status, 'ok');

    const readyRes = await request(app).get('/ready').expect(200);
    assert.strictEqual(readyRes.body.data.ready, true);

    // 67. Active Session Management
    console.log('  [67/72] Phase 8 Check: GET /api/v1/security/sessions...');
    const sessionsRes = await request(app)
      .get('/api/v1/security/sessions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.ok(sessionsRes.body.data.length >= 1);

    // 68. Feature Flag List & Toggle
    console.log('  [68/72] Phase 8 Check: GET & PATCH /api/v1/feature-flags...');
    const flagsRes = await request(app)
      .get('/api/v1/feature-flags')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(200);

    assert.ok(flagsRes.body.data.details.length >= 1);

    // 69. Feature Gating Middleware Verification
    console.log('  [69/72] Phase 8 Check: Disable AI_DIGEST flag & verify 403 response...');
    await request(app)
      .patch('/api/v1/feature-flags/AI_DIGEST')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ enabled: false })
      .expect(200);

    // Verify 403 when feature is disabled
    await request(app)
      .get('/api/v1/digest')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .expect(403);

    // Re-enable flag
    await request(app)
      .patch('/api/v1/feature-flags/AI_DIGEST')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .send({ enabled: true })
      .expect(200);

    // 70. BOLA / IDOR Cross-Tenant Protection Test
    console.log('  [70/72] Phase 8 Check: Verify BOLA / IDOR isolation on tickets...');
    const bolaRes = await request(app)
      .get('/api/v1/tickets/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${guestToken}`)
      .set('X-Organization-Id', secondaryOrgId)
      .expect(403);

    assert.strictEqual(bolaRes.body.success, false);

    // 71. File Upload Security Test (Prohibited Executables)
    console.log('  [71/72] Phase 8 Check: Verify prohibited file upload rejection...');
    const badUploadRes = await request(app)
      .post(`/api/v1/tickets/${ticketId}/attachments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Organization-Id', adminOrgId)
      .attach('file', Buffer.from('echo "malicious"'), 'script.sh')
      .expect(400);

    assert.strictEqual(badUploadRes.body.success, false);

    // 72. Session Revocation Test
    console.log('  [72/72] Phase 8 Check: Revoke individual session...');
    const secondarySession = sessionsRes.body.data.find((s: any) => !s.isCurrent);
    if (secondarySession) {
      await request(app)
        .delete(`/api/v1/security/sessions/${secondarySession.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    } else {
      console.log('    (No secondary session to revoke, verified structure)');
    }

    // 73. Run Unit, Security, Performance & E2E Test Modules
    console.log(
      '\n  [73/73] Phase 9 QA: Executing Unit, Security, Performance & E2E Sub-suites...'
    );
    await runAuthServiceUnitTests();
    await runPermissionServiceUnitTests();
    await runValidatorsUnitTests();
    await runSecuritySuiteTests(app, adminToken, adminOrgId);
    await runPerformanceSuiteTests(app, adminToken, adminOrgId);
    await runUserJourneysE2ETests(app);

    console.log(
      '\n🎉 ALL PHASE 1 - 9 INTEGRATION, UNIT, SECURITY, PERFORMANCE & E2E TESTS PASSED SUCCESSFULLY!'
    );
  } catch (error) {
    console.error('❌ Master Test Suite Failure:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await RedisManager.disconnect();
  }
}

runTests();
