'use client'

import React from 'react'
import { SidebarProvider } from '@/app/hooks/context/sidebar-context'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}
