'use client';

import Link from 'next/link';
import {
  FaChartLine,
  FaRocket,
  FaWallet,
  FaBrain,
  FaGlobe,
} from 'react-icons/fa';

export default function Sidebar() {
  return (
    <>
      {/* Sidebar inferior para mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around items-center h-16 z-50 border-t border-gray-800 md:hidden shadow-lg"
        role="navigation"
        aria-label="Menu inferior"
      >
        <SidebarItem href="/dashboard" icon={<FaChartLine />} label="Painel" />
        <SidebarItem href="/ziller" icon={<FaRocket />} label="IA" />
        <SidebarItem href="/games/investir" icon={<FaWallet />} label="Investir" />
        <SidebarItem href="/como-funciona" icon={<FaBrain />} label="Como Funciona" />
        <SidebarItem href="/ecossistema" icon={<FaGlobe />} label="Ecossistema" />
      </nav>

      {/* Sidebar lateral fixa para desktop */}
      <aside
        className="hidden md:flex flex-col bg-gray-900 text-white w-56 h-screen fixed top-0 left-0 border-r border-gray-800 shadow-lg p-4 z-40"
        role="navigation"
        aria-label="Menu lateral"
      >
        <h2 className="text-xl font-bold mb-6">📊 Ziller.AI</h2>
        <div className="flex flex-col gap-4">
          <SidebarItem href="/dashboard" icon={<FaChartLine />} label="Painel" />
          <SidebarItem href="/ziller" icon={<FaRocket />} label="IA" />
          <SidebarItem href="/games/investir" icon={<FaWallet />} label="Investir" />
          <SidebarItem href="/como-funciona" icon={<FaBrain />} label="Como Funciona" />
          <SidebarItem href="/ecossistema" icon={<FaGlobe />} label="Ecossistema" />
        </div>
      </aside>
    </>
  );
}

type SidebarItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

function SidebarItem({ href, icon, label }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-base hover:text-yellow-400 transition-colors duration-200"
    >
      <div className="text-lg">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
