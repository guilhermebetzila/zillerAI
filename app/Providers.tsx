'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/hooks/context/AuthContext';
import { SidebarProvider } from '@/hooks/context/sidebar-context';
import Sidebar from '@components/Sidebar';   // corrigido
import { Topbar } from '@components/TopBar'; // corrigido

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SidebarProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
            <Topbar />
            <main className="flex-1 transition-all duration-300 overflow-y-auto">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
