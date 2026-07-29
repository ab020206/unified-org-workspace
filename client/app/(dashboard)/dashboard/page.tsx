'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@workspace/shared-types';
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';
import { OrgAdminDashboard } from '@/components/dashboards/OrgAdminDashboard';
import { SupportAgentDashboard } from '@/components/dashboards/SupportAgentDashboard';
import { ReviewerDashboard } from '@/components/dashboards/ReviewerDashboard';
import { GuestDashboard } from '@/components/dashboards/GuestDashboard';
import { AuditorDashboard } from '@/components/dashboards/AuditorDashboard';

export default function DashboardPage() {
  const { user, activeOrganization } = useAuth();
  const role = user?.isPlatformUser ? Role.SUPER_ADMIN : ((activeOrganization?.userRole as Role) || Role.GUEST);

  // Dynamically render role-tailored dashboard experience
  switch (role) {
    case Role.SUPER_ADMIN:
      return <SuperAdminDashboard />;

    case Role.ADMIN:
      return <OrgAdminDashboard />;

    case Role.SUPPORT_AGENT:
      return <SupportAgentDashboard />;

    case Role.REVIEWER:
      return <ReviewerDashboard />;

    case Role.GUEST:
      return <GuestDashboard />;

    case Role.AUDITOR:
      return <AuditorDashboard />;

    default:
      return <GuestDashboard />;
  }
}
