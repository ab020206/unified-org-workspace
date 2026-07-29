import { NextResponse } from 'next/server';
import { HealthService } from '@/src/services/health.service';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

const healthService = new HealthService();

export async function GET() {
  try {
    const data = await healthService.getHealthStatus();
    return NextResponse.json(createSuccessResponse(data, 'Health check successful'));
  } catch (error) {
    return handleApiError(error);
  }
}
