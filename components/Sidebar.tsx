'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaChartLine,
  FaRocket,
  FaWallet,
  FaGlobe,
} from 'react-icons/fa';

export default function Sidebar() {
  return (
    <>
      {/* Sidebar inferior para mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white h-16 z-50 border-t border-gray-800 shadow-lg"
        role="navigation"
        aria-label="Menu inferior"
      >
        <div className="relative flex justify-around items-center h-full">
          <SidebarItem href="/dashboard" icon={<FaChartLine />} label="Painel" />
          <SidebarItem href="/ziller" icon={<FaRocket />} label="IA" />

          {/* Botão central estilo Mercado Pago - perfeitamente centralizado */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-900">
              <Image
                src="/img/logosidebar.png"
                alt="Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>

          <SidebarItem href="/games/investir" icon={<FaWallet />} label="Investir" />
          <SidebarItem href="/ecossistema" icon={<FaGlobe />} label="Ecossistema" />
        </div>
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
