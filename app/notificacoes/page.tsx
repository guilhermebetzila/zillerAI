'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';

interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);

  const fetchNotificacoes = async () => {
    try {
      const res = await fetch('/api/notificacoes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotificacoes(data);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
    // ✅ Marca notificações como vistas
    localStorage.setItem('notificacoes_vistas', 'true');
  }, []);

  return (
    <LayoutWrapper>
      <div className="min-h-screen p-4 bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">🔔 Notificações</h1>
        {notificacoes.length === 0 ? (
          <p className="text-gray-400">Nenhuma notificação no momento.</p>
        ) : (
          <ul className="space-y-2">
            {notificacoes.map((n) => (
              <li
                key={n.id}
                className={`p-3 rounded-xl shadow-md ${
                  n.lida ? 'bg-gray-800' : 'bg-green-600'
                }`}
              >
                {n.mensagem}
              </li>
            ))}
          </ul>
        )}
      </div>
    </LayoutWrapper>
  );
}
