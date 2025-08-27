'use client';

import { SidebarProvider } from '@/hooks/context/sidebar-context';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
