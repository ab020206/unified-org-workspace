import assert from 'assert';
import request from 'supertest';
import { Express } from 'express';

export async function runUserJourneysE2ETests(app: Express) {
  console.log('    • Running End-to-End User Journey Workflows...');

  const e2eEmail = `e2e-admin-${Date.now()}@example.com`;

  // 1. Admin Registration Journey
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      firstName: 'E2E',
      lastName: 'Admin',
      email: e2eEmail,
      password: 'Password123!',
      organizationName: 'E2E Test Enterprise',
    })
    .expect(201);

  const token = regRes.body.data.tokens.accessToken;

  // 2. Fetch User Orgs & Switch Context
  const orgsRes = await request(app)
    .get('/api/v1/organizations')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);

  const orgId = orgsRes.body.data[0].id;

  // 3. Create Ticket Journey
  const ticketRes = await request(app)
    .post('/api/v1/tickets')
    .set('Authorization', `Bearer ${token}`)
    .set('X-Organization-Id', orgId)
    .send({
      title: 'E2E Journey Ticket Test',
      description: 'End-to-end full user journey validation.',
    })
    .expect(201);

  assert.strictEqual(ticketRes.body.success, true);

  // 4. Logout Journey
  await request(app)
    .post('/api/v1/auth/logout')
    .set('Authorization', `Bearer ${token}`)
    .send({ refreshToken: regRes.body.data.tokens.refreshToken })
    .expect(200);

  console.log('      ✔ E2E user journey workflows completed successfully');
}
