'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@ui/button'; // corrigido
import { useAuth } from '@/hooks/context/AuthContext';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function IndicacaoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [linkConvite, setLinkConvite] = useState('');
  const [quantidadeIndicados, setQuantidadeIndicados] = useState<number | null>(null);

  useEffect(() => {
    if (user?.nome) {
      // Gera o link baseado no nome do usuário
      const nomeFormatado = user.nome.toLowerCase().replace(/\s+/g, '');
      const link = `https://betdreams.com/convite/${nomeFormatado}`;
      setLinkConvite(link);

      // Busca a quantidade de indicados do usuário
      fetch(`${API_BASE_URL}/api/indicacoes/quantidade`)
        .then(res => res.json())
        .then(data => {
          if (data.quantidade !== undefined) {
            setQuantidadeIndicados(data.quantidade);
          }
        })
        .catch(() => {
          setQuantidadeIndicados(null);
        });
    }
  }, [user]);

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkConvite);
      alert('Link copiado com sucesso!');
    } catch (err) {
      alert('Erro ao copiar o link');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">🔗 Link de Indicação</h1>

      {user ? (
        <>
          <p className="text-lg mb-2">Bem-vindo, {user.nome}!</p>
          <p className="text-lg mb-4 break-words">{linkConvite}</p>

          {quantidadeIndicados !== null && (
            <p className="text-lg mb-4">
              Você já indicou <strong>{quantidadeIndicados}</strong> pessoa(s).
            </p>
          )}
        </>
      ) : (
        <p className="text-lg mb-4 text-red-500">Carregando usuário...</p>
      )}

      <div className="flex gap-4">
        <Button
          onClick={copiarLink}
          className="bg-green-600 hover:bg-green-700"
          disabled={!linkConvite}
        >
          📋 Copiar Link
        </Button>
        <Button
          onClick={() => router.back()}
          className="bg-white text-black hover:bg-gray-300"
        >
          🔙 Voltar
        </Button>
      </div>
    </main>
  );
}
