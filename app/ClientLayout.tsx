'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/hooks/context/AuthContext';
import { SidebarProvider } from '@/hooks/context/sidebar-context'; // ✅ Caminho corrigido

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
