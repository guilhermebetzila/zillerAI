'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Investimento = {
  id: number;
  valor: string;
  percentualDiario: string;
  rendimentoAcumulado: string;
  criadoEm: string;
  ativo: boolean;
};

type Rendimento = {
  id: number;
  dateKey: string;
  base: string;
  rate: string;
  amount: string;
  creditedAt: string;
};

export default function InvestimentosPage() {
  const [saldo, setSaldo] = useState<number>(0);
  const [valorInvestido, setValorInvestido] = useState<number>(0);
  const [bonusResidual, setBonusResidual] = useState<number>(0);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [rendimentos, setRendimentos] = useState<Rendimento[]>([]);
  const [novoValor, setNovoValor] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingReinvestir, setLoadingReinvestir] = useState(false);
  const [podeReinvestir, setPodeReinvestir] = useState(true);

  const [saldoTotal, setSaldoTotal] = useState<number>(0);

  const carregarDados = async () => {
    try {
      const res = await fetch("/api/investir");
      const data = await res.json();
      if (res.ok) {
        setSaldo(parseFloat(data.saldo) || 0);
        setValorInvestido(parseFloat(data.valorInvestido) || 0);
        setBonusResidual(parseFloat(data.bonusResidual) || 0);
        setInvestimentos(data.investimentos || []);
        setRendimentos(data.rendimentos || []);

        const hoje = new Date().toISOString().split("T")[0];
        const ultimoRendimento = data.rendimentos?.[0]?.dateKey;
        setPodeReinvestir(ultimoRendimento !== hoje);

        // Inicializa saldo total
        const rendimentoHoje = data.rendimentos?.[0]?.amount
          ? parseFloat(data.rendimentos[0].amount)
          : 0;
        setSaldoTotal((parseFloat(data.saldo) || 0) + rendimentoHoje + (parseFloat(data.bonusResidual) || 0));
      } else {
        toast.error(data.error || "Erro ao carregar dados.");
      }
    } catch {
      toast.error("❌ Erro de conexão.");
    }
  };

  const investir = async () => {
    const valorNum = parseFloat(novoValor);
    if (!valorNum || valorNum <= 0) {
      toast.error("Digite um valor válido.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/investir/novo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorNum }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Investimento realizado!");
        setNovoValor("");
        carregarDados();
      } else {
        toast.error(data.error || "Erro ao investir.");
      }
    } catch {
      toast.error("❌ Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const reinvestir = async () => {
    if (saldo <= 0) {
      toast.error("❌ Você não tem saldo disponível para reinvestir.");
      return;
    }

    setLoadingReinvestir(true);
    try {
      const res = await fetch("/api/reinvestir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: saldo }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("🔄 Reinvestimento realizado com sucesso!");
        setSaldo(0);
        setPodeReinvestir(false);
        carregarDados();
      } else {
        toast.error(data.error || "Erro ao reinvestir.");
      }
    } catch {
      toast.error("❌ Erro de conexão.");
    } finally {
      setLoadingReinvestir(false);
    }
  };

  // Atualiza saldo total automaticamente em tempo real
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (investimentos.length > 0) {
        // calcula rendimento diário total em percentual
        const rendimentoTotal = investimentos.reduce((acc, inv) => {
          const valor = parseFloat(inv.valor);
          const taxa = parseFloat(inv.percentualDiario) / 100;
          return acc + valor * taxa;
        }, 0);

        // soma ao saldoTotal
        setSaldoTotal(prev => prev + rendimentoTotal / 86400); // assume 86400 segundos por dia
      }
    }, 1000); // atualiza a cada 1 segundo

    return () => clearInterval(intervalo);
  }, [investimentos]);

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold text-center">📈 Área de Investimentos</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Saldo Atual</p>
          <p className="text-green-400 text-xl font-bold">{saldoTotal.toFixed(2)} USDT</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Total Investido</p>
          <p className="text-yellow-400 text-xl font-bold">{valorInvestido.toFixed(2)} USDT</p>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow space-y-3">
        <label className="block">Valor para investir (USDT)</label>
        <input
          type="number"
          value={novoValor}
          onChange={(e) => setNovoValor(e.target.value)}
          placeholder="Ex: 100"
          className="w-full p-2 rounded text-black"
        />
        <button
          onClick={investir}
          disabled={loading}
          className="bg-yellow-600 w-full mt-2 p-2 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? "Processando..." : "Investir"}
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow space-y-3">
        <p>💰 Deseja reinvestir todo o saldo disponível?</p>
        <button
          onClick={reinvestir}
          disabled={loadingReinvestir || !podeReinvestir}
          className={`w-full mt-2 p-2 rounded disabled:opacity-50 ${
            podeReinvestir ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {loadingReinvestir ? "Processando..." : "🔄 Reinvestir"}
        </button>
        {!podeReinvestir && (
          <p className="text-sm text-gray-400 mt-1">
            Aguarde o próximo rendimento do dia para reinvestir novamente.
          </p>
        )}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">📜 Meus Investimentos</h2>
        {investimentos.length === 0 ? (
          <p className="text-gray-400">Nenhum investimento realizado.</p>
        ) : (
          <ul className="space-y-2">
            {investimentos.map((inv) => (
              <li key={inv.id} className="bg-gray-700 p-3 rounded">
                <p>💵 Valor: <span className="text-yellow-400">{inv.valor} USDT</span></p>
                <p>📅 Criado em: {new Date(inv.criadoEm).toLocaleString()}</p>
                <p>📊 Acumulado: <span className="text-green-400">{inv.rendimentoAcumulado} USDT</span></p>
                <p>Status: {inv.ativo ? "✅ Ativo" : "❌ Finalizado"}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">💰 Rendimentos Recentes</h2>
        {rendimentos.length === 0 ? (
          <p className="text-gray-400">Nenhum rendimento registrado.</p>
        ) : (
          <ul className="space-y-2">
            {rendimentos.map((r) => (
              <li key={r.id} className="bg-gray-700 p-3 rounded">
                <p>📅 {new Date(r.creditedAt).toLocaleString()}</p>
                <p>🔑 Dia: {r.dateKey}</p>
                <p>💵 Base: {r.base} USDT</p>
                <p>📈 Taxa: {(parseFloat(r.rate) * 100).toFixed(2)}%</p>
                <p className="text-green-400">+ {r.amount} USDT</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => window.history.back()}
        className="bg-gray-700 w-full mt-6 p-2 rounded-lg font-semibold hover:bg-gray-600 transition"
      >
        ⬅ Voltar
      </button>
    </div>
  );
}
