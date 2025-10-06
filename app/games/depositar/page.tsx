'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';

const USDT_WALLET = process.env.NEXT_PUBLIC_USDT_WALLET_ADDRESS || '';

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
  const [txHashUSDT, setTxHashUSDT] = useState('');
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
        setMsg('Depósito USDT solicitado. Agora envie o valor e cole o hash abaixo.');
      }
    } catch {
      setErro('Erro ao solicitar depósito USDT.');
    } finally {
      setLoadingUSDT(false);
    }
  };

  const confirmarUSDT = async () => {
    setErro('');
    setMsg('');
    setLoadingUSDT(true);
    try {
      if (!txHashUSDT) {
        setErro('Informe o hash da transação.');
        return;
      }
      if (!depositoId) {
        setErro('Solicite o depósito antes de confirmar.');
        return;
      }

      const res = await fetch('/api/depositos/usdt/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ depositoId, hash: txHashUSDT }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data?.error || 'Falha ao verificar transação.');
      } else {
        setMsg(data?.message || 'Depósito USDT confirmado.');
        setTxHashUSDT('');
        setValorUSDT('');
        setDepositoId(null);
        await buscarHistorico();
      }
    } catch {
      setErro('Erro ao confirmar depósito USDT.');
    } finally {
      setLoadingUSDT(false);
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

        {/* Solicitar e Confirmar */}
        <div className="mt-6 bg-zinc-800 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">✅ Solicitar e confirmar depósito USDT</h3>

          <label className="text-white text-xs mb-1 block">Valor (USDT)</label>
          <input
            className="w-full p-2 rounded bg-black border border-zinc-700 text-white mb-3"
            type="number"
            placeholder="Ex: 10"
            value={valorUSDT}
            onChange={(e) => setValorUSDT(e.target.value)}
          />

          {!depositoId ? (
            <button
              onClick={solicitarUSDT}
              disabled={loadingUSDT || !valorUSDT}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded transition"
            >
              {loadingUSDT ? 'Solicitando...' : 'Solicitar depósito USDT'}
            </button>
          ) : (
            <>
              <label className="text-white text-xs mb-1 block mt-3">
                Hash da transação (BscScan)
              </label>
              <input
                className="w-full p-2 rounded bg-black border border-zinc-700 text-white mb-3 font-mono"
                placeholder="0x..."
                value={txHashUSDT}
                onChange={(e) => setTxHashUSDT(e.target.value.trim())}
              />
              <button
                onClick={confirmarUSDT}
                disabled={loadingUSDT || !txHashUSDT}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded transition"
              >
                {loadingUSDT ? 'Verificando...' : 'Confirmar depósito USDT'}
              </button>
            </>
          )}
        </div>

        {/* Mensagens */}
        {erro && <p className="text-red-500 mt-3 text-sm">❌ {erro}</p>}
        {msg && <p className="text-green-400 mt-3 text-sm">✅ {msg}</p>}

        {/* Histórico Confirmados */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">
            ✅ USDT Confirmados
          </h2>
          {onchainConfirmados.length === 0 ? (
            <p className="text-gray-400">Nenhum depósito confirmado ainda.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {onchainConfirmados.map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-gray-200 border-b border-gray-600 pb-2 flex justify-between items-center"
                >
                  <span>
                    💰 {item.amount || 0} USDT –{' '}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString('pt-BR')
                      : '-'}
                    <br />
                    {item.txHash && (
                      <>
                        🔗{' '}
                        <a
                          href={`https://bscscan.com/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          Ver no BscScan
                        </a>
                      </>
                    )}
                  </span>
                  <StatusBadge status={item.status || 'confirmado'} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Histórico Pendentes */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">
            ⏳ USDT Pendentes
          </h2>
          {onchainPendentes.length === 0 ? (
            <p className="text-gray-400">Nenhum depósito pendente.</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {onchainPendentes.map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-gray-200 border-b border-gray-600 pb-2 flex justify-between items-center"
                >
                  <span>
                    ⚠️ {item.amount || 0} USDT –{' '}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString('pt-BR')
                      : '-'}
                    <br />
                    {item.txHash && (
                      <>
                        🔗{' '}
                        <a
                          href={`https://bscscan.com/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline"
                        >
                          Ver no BscScan
                        </a>
                      </>
                    )}
                  </span>
                  <StatusBadge status={item.status || 'pendente'} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
