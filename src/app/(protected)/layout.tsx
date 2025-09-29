'use client';

import { AppSidebar } from '@/widgets/sidebar/ui/sidebar';
import { AppHeader } from '@/widgets/header/ui/header';
import { useState } from 'react';
import { RequireAuth } from '@/shared/lib/auth/require-auth';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RequireAuth>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
