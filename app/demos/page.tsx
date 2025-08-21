'use client';

import Link from 'next/link';
import {
  FaChartLine,
  FaRocket,
  FaWallet,
  FaBrain,
  FaGlobe
} from 'react-icons/fa';

export default function Sidebar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex justify-around items-center h-16 z-50 border-t border-gray-800 md:hidden shadow-lg"
      role="navigation"
      aria-label="Menu inferior"
    >
      <SidebarItem href="/dashboard" icon={<FaChartLine />} label="Painel" />
      {/* Alterado de /games/ia para /demos */}
      <SidebarItem href="/demos" icon={<FaRocket />} label="IA" />
      <SidebarItem href="/games/investir" icon={<FaWallet />} label="Investir" />
      <SidebarItem href="/como-funciona" icon={<FaBrain />} label="Como Funciona" />
      <SidebarItem href="/ecossistema" icon={<FaGlobe />} label="Ecossistema" />
    </nav>
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
      className="flex flex-col items-center justify-center text-xs hover:text-yellow-400 transition-colors duration-200"
    >
      <div className="text-lg">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
