'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

const USDT_WALLET = process.env.NEXT_PUBLIC_USDT_WALLET_ADDRESS || '';
const FIXED_HASH = '177126260'; // Hash fixo para copiar

function StatusBadge({ status }: { status: string }) {
  const cores: Record<string, string> = {
    confirmado: 'bg-green-500 text-black',
    pendente: 'bg-orange-500 text-black',
    aguardando: 'bg-yellow-500 text-black',
    cancelado: 'bg-red-600 text-white',
    em_analise: 'bg-blue-500 text-white',
  };

  const labels: Record<string, string> = {
    confirmado: 'Confirmado',
    pendente: 'Pendente',
    aguardando: 'Aguardando Vinculação',
    cancelado: 'Cancelado',
    em_analise: 'Em Análise',
  };

  return (
    <span
      className={`ml-2 px-2 py-1 text-xs rounded ${
        cores[status] || 'bg-gray-600 text-white'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export default function Depositar() {
  const router = useRouter();
  const { data: session } = useSession();

  const [valorUSDT, setValorUSDT] = useState('');
  const [depositoId, setDepositoId] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingUSDT, setLoadingUSDT] = useState(false);
  const [onchainConfirmados, setOnchainConfirmados] = useState<any[]>([]);
  const [onchainPendentes, setOnchainPendentes] = useState<any[]>([]);

  useEffect(() => {
    buscarHistorico();
  }, []);

  async function buscarHistorico() {
    try {
      if (!API_BASE_URL) return;
      const res = await fetch(`${API_BASE_URL}/api/depositos`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const dados = await res.json();
      setOnchainConfirmados(dados.onchainConfirmados || []);
      setOnchainPendentes(dados.onchainPendentes || []);
    } catch {
      setErro('Erro ao carregar histórico de depósitos.');
    }
  }

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
        setMsg(
          'Depósito USDT solicitado. Agora envie o valor e use o hash fixo abaixo.'
        );
      }
    } catch {
      setErro('Erro ao solicitar depósito USDT.');
    } finally {
      setLoadingUSDT(false);
    }
  };

  const copiarHash = async () => {
    try {
      await navigator.clipboard.writeText(FIXED_HASH);
      alert('Hash copiado com sucesso! Use apenas transferências Binance → Binance.');
    } catch {
      prompt('Copie manualmente o hash:', FIXED_HASH);
    }
  };

  const copiarCarteira = async () => {
    try {
      if (!USDT_WALLET) return;
      await navigator.clipboard.writeText(USDT_WALLET);
      alert('Endereço da carteira copiado com sucesso!');
    } catch {
      prompt('Copie manualmente o endereço da carteira:', USDT_WALLET);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 py-10">
      {/* 🔔 Mensagem no topo */}
      <div className="bg-yellow-400 text-black text-sm p-3 rounded-lg mb-6 text-center max-w-md">
        ⚠️ <b>ATENÇÃO:</b> As transferências serão aceitas apenas Binance → Binance.
        <br />
        Envie o valor e use o <b>hash fixo abaixo</b> para total transparência: <b>{FIXED_HASH}</b>.
        <br />
        ⏱️ <b>Tempo médio de confirmação: 1 a 5 minutos.</b>
        <div className="mt-3">
          <button
            onClick={copiarHash}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded-lg transition inline-block"
          >
            📋 Copiar Hash
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
        Adicione saldo enviando USDT (rede BEP-20 / BSC) para a carteira abaixo.
      </p>

      <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md">
        {/* Carteira USDT */}
        <div className="bg-zinc-800 p-4 rounded-lg text-sm">
          <p className="mb-2">🚨 Envie USDT para o endereço abaixo:</p>
          <p className="font-mono break-all text-green-400">
            {USDT_WALLET || 'Carteira não configurada'}
          </p>
          <button
            onClick={copiarCarteira}
            disabled={!USDT_WALLET}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
          >
            📋 Copiar Carteira
          </button>
        </div>

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
  );
}
