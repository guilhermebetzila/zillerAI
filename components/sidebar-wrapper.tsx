'use client'

import { useState, ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import TopHeader from '@/components/top-header'

type SidebarWrapperProps = {
  children: ReactNode
}

export default function SidebarWrapper({ children }: SidebarWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Topo com botão de menu */}
      <TopHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Overlay escuro no mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#141414] z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:block md:w-64 bg-[#141414] text-white p-4">
        <Sidebar />
      </aside>

      {/* Conteúdo principal */}
      <main className="md:ml-64 mt-16 p-4 bg-[#0e0e0e] min-h-screen">
        {children}
      </main>
    </>
  )
}

