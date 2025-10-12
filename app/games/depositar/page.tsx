'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const BINANCE_ID = '177126260'; // ID fixo para copiar

export default function Depositar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [valorUSDT, setValorUSDT] = useState('');
  const [depositoId, setDepositoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingUSDT, setLoadingUSDT] = useState(false);

  const solicitarUSDT = async () => {
    setErro('');
    setMsg('');
    setLoadingUSDT(true);
    try {
      if (!session?.user?.email) {
        setErro('Você precisa estar logado para solicitar depósito.');
        return;
      }
      if (!valorUSDT) {
        setErro('Informe o valor do depósito em USDT.');
        return;
      }

      const res = await fetch('/api/depositos/usdt/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ valor: Number(valorUSDT) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data?.error || 'Falha ao solicitar depósito.');
      } else {
        setDepositoId(data.depositoId);
        setMsg('Depósito USDT solicitado. Use o ID fixo abaixo para total transparência.');
      }
    } catch {
      setErro('Erro ao solicitar depósito USDT.');
    } finally {
      setLoadingUSDT(false);
    }
  };

  const copiarId = async () => {
    try {
      await navigator.clipboard.writeText(BINANCE_ID);
      alert('ID da Binance copiado com sucesso! Use apenas transferências Binance → Binance.');
    } catch {
      prompt('Copie manualmente o ID:', BINANCE_ID);
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto bg-black text-white px-4 py-10">
      <div className="flex flex-col items-center justify-start min-h-full">
        {/* 🔔 Mensagem no topo */}
        <div className="bg-yellow-400 text-black text-sm p-3 rounded-lg mb-6 text-center max-w-md">
          ⚠️ <b>ATENÇÃO:</b> As transferências serão aceitas apenas Binance → Binance.
          <br />
          Use o <b>ID fixo abaixo</b> para total transparência: <b>{BINANCE_ID}</b>.
          <br />
          ⏱️ <b>Tempo médio de confirmação: 1 a 5 minutos.</b>
          <div className="mt-3">
            <button
              onClick={copiarId}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded-lg transition inline-block"
            >
              📋 Copiar ID
            </button>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="mb-6 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg"
        >
          ⬅️ Voltar
        </button>

        <h1 className="text-2xl font-bold mb-2">💰 Depósito via USDT</h1>
        <p className="mb-6 text-sm text-gray-300">
          Adicione saldo enviando USDT (rede BEP-20 / BSC) usando o ID da Binance acima.
        </p>

        <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md">
          {/* Solicitar Depósito */}
          <div className="mt-6 bg-zinc-800 p-4 rounded-lg">
            <label className="text-white text-xs mb-1 block">Valor (USDT)</label>
            <input
              className="w-full p-2 rounded bg-black border border-zinc-700 text-white mb-3"
              type="number"
              placeholder="Ex: 10"
              value={valorUSDT}
              onChange={(e) => setValorUSDT(e.target.value)}
            />

            <button
              onClick={solicitarUSDT}
              disabled={loadingUSDT || !valorUSDT}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded transition"
            >
              {loadingUSDT ? 'Solicitando...' : 'Solicitar depósito USDT'}
            </button>
          </div>

          {/* Mensagens */}
          {erro && <p className="text-red-500 mt-3 text-sm">❌ {erro}</p>}
          {msg && <p className="text-green-400 mt-3 text-sm">✅ {msg}</p>}
        </div>
      </div>
    </div>
  );
}
