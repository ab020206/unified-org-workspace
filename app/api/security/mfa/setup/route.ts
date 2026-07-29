import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';

export async function POST(request: NextRequest) {
  try {
    requireAuth(request);
    const mfaSetupData = {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/Froncort:demouser@froncort.ai?secret=JBSWY3DPEHPK3PXP&issuer=Froncort',
      backupCodes: ['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6'],
    };

    return NextResponse.json(createSuccessResponse(mfaSetupData, 'MFA setup initialized successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
