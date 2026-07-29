import assert from 'assert';
import request from 'supertest';
import { Express } from 'express';

export async function runPerformanceSuiteTests(app: Express, token: string, orgId: string) {
  console.log('    • Running Performance & Query Latency Benchmarks...');

  const startTime = Date.now();
  const iterations = 5;

  for (let i = 0; i < iterations; i++) {
    const res = await request(app)
      .get('/api/v1/tickets?limit=20')
      .set('Authorization', `Bearer ${token}`)
      .set('X-Organization-Id', orgId)
      .expect(200);

    assert.strictEqual(res.body.success, true);
  }

  const durationMs = Date.now() - startTime;
  const avgLatency = durationMs / iterations;

  console.log(
    `      ✔ Completed ${iterations} queries in ${durationMs}ms (Avg: ${avgLatency.toFixed(2)}ms per request)`
  );
  assert.ok(avgLatency < 200, 'Average query latency exceeded 200ms threshold');
}
