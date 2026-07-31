import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ProtectedLayoutPlaceholder } from '@/components/ProtectedLayoutPlaceholder';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InspectorProvider } from '@/providers/InspectorProvider';
import { InspectorDrawer } from '@/components/ui/InspectorDrawer';
import { EnterpriseBackground } from '@/components/ui/EnterpriseBackground';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <InspectorProvider>
      <div className="flex min-h-screen bg-background relative">
        <EnterpriseBackground />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 z-10">
          <Navbar />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            <ProtectedLayoutPlaceholder>
              <ErrorBoundary>{children}</ErrorBoundary>
            </ProtectedLayoutPlaceholder>
          </main>
        </div>
        <InspectorDrawer />
      </div>
    </InspectorProvider>
  );
}
