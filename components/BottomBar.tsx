'use client';

import Link from 'next/link';
import { Home, Gamepad2, Landmark, Tv2 } from 'lucide-react';

export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 z-40 md:hidden">
      <div className="flex justify-around items-center h-16 text-white">
        
        <Link href="/dashboard" className="flex flex-col items-center">
          <Home size={22} />
          <span className="text-xs mt-1">Perfil</span>
        </Link>

        <Link href="/cassino" className="flex flex-col items-center">
          <Gamepad2 size={22} />
          <span className="text-xs mt-1">Cassino</span>
        </Link>

        <Link href="/esportes" className="flex flex-col items-center">
          <Landmark size={22} />
          <span className="text-xs mt-1">Futebol</span>
        </Link>

        <Link href="/ao-vivo" className="flex flex-col items-center">
          <Tv2 size={22} />
          <span className="text-xs mt-1">Ao Vivo</span>
        </Link>

      </div>
    </div>
  );
}
