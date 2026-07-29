import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/src/lib/apiAuth';
import { handleApiError } from '@/src/lib/errors';
import { createSuccessResponse } from '@/src/utils/response';
import { prisma } from '@/src/config/prisma';

export async function GET(request: NextRequest) {
  try {
    requireAuth(request);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    const formattedUsers = users.map((u) => {
      const activeMember = u.memberships.find((m) => m.isActive);
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.isPlatformUser ? 'SUPER_ADMIN' : activeMember?.role || 'USER',
        org: u.isPlatformUser
          ? 'Global Platform'
          : activeMember?.organization?.name || 'Unassigned',
        status: u.isActive ? 'ACTIVE' : 'INACTIVE',
        createdAt: u.createdAt.toISOString(),
      };
    });

    return NextResponse.json(createSuccessResponse(formattedUsers, 'Platform users retrieved successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}
