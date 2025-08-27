'use client';

import { useEffect, useState } from 'react';
import { io as clientIO } from 'socket.io-client';
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socket = clientIO('http://localhost:4000'); // Altere para produção

export function Header() {
  const [saldo, setSaldo] = useState<number>(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
    setUser(usuario);

    if (usuario?.saldo) {
      setSaldo(Number(usuario.saldo) || 0);
    }

    socket.on('saldo:atualizado', ({ email, valor }) => {
      const usuarioAtual = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');

      if (usuarioAtual?.email === email) {
        usuarioAtual.saldo = Number(usuarioAtual.saldo || 0) + Number(valor || 0);
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtual));
        setSaldo(usuarioAtual.saldo);
        console.log('💰 Saldo atualizado via socket:', usuarioAtual.saldo);
      }
    });

    return () => {
      socket.off('saldo:atualizado');
    };
  }, []);

  return (
    <header className="bg-green-600 text-white p-4 w-full">
      <div className="flex items-center justify-between w-full px-4">
        {/* Logo e menu */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-green-700">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">BD</span>
            </div>
            <h1 className="text-xl font-bold">BetDreams</h1>
          </div>
        </div>

        {/* Campo de busca (desktop) */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Buscar esportes, times..." className="pl-10 bg-white text-black" />
          </div>
        </div>

        {/* Saldo do usuário */}
        <div className="flex items-center gap-2">
          {user && (
            <span className="mr-2 font-bold text-yellow-300">
              Saldo: R${Number(saldo).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
