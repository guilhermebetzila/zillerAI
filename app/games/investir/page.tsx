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
  const [valorInvestido, setValorInvestido] = useState<number>(0);
  const [bonusResidual, setBonusResidual] = useState<number>(0);
  const [rendimentoDiario, setRendimentoDiario] = useState<number>(0);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [rendimentos, setRendimentos] = useState<Rendimento[]>([]);
  const [novoValor, setNovoValor] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saldoTotal, setSaldoTotal] = useState<number>(0);
  const [bloqueado, setBloqueado] = useState<boolean>(false);
  const [progresso, setProgresso] = useState<number>(0);
  const [falta, setFalta] = useState<number>(0);

  const carregarDados = async () => {
    try {
      const [resInvestir, resSaldo] = await Promise.all([
        fetch("/api/investir"),
        fetch("/api/saldo"),
      ]);

      const dataInvestir = await resInvestir.json();
      const dataSaldo = await resSaldo.json();

      if (resInvestir.ok && resSaldo.ok) {
        setValorInvestido(parseFloat(dataInvestir.valorInvestido) || 0);
        setInvestimentos(dataInvestir.investimentos || []);
        setRendimentos(dataInvestir.rendimentos || []);

        // ✅ Usa o saldo real da carteira
        setSaldoTotal(Number(dataSaldo.saldo ?? 0));
        setRendimentoDiario(Number(dataSaldo.rendimento ?? 0));
        setBonusResidual(Number(dataSaldo.bonusResidual ?? 0));

        // 🚫 Nova regra + progresso visual
        const ativo = dataInvestir.investimentos?.find((inv: Investimento) => inv.ativo);
        if (ativo) {
          const valor = parseFloat(ativo.valor);
          const acumulado = parseFloat(ativo.rendimentoAcumulado);
          const pct = (acumulado / valor) * 100; // porcentagem atual
          const faltando = Math.max(valor * 2 - acumulado, 0);

          setProgresso(Math.min(pct, 200));
          setFalta(faltando);

          if (acumulado < valor * 2) {
            setBloqueado(true);
          } else {
            setBloqueado(false);
          }
        } else {
          setBloqueado(false);
          setProgresso(0);
          setFalta(0);
        }

      } else {
        toast.error("Erro ao carregar dados.");
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

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
      <h1 className="text-2xl font-bold text-center">📈 Área de Investimentos</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Saldo Atual</p>
          <p className="text-green-400 text-xl font-bold">
            {saldoTotal.toFixed(2)} USDT
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Total Investido</p>
          <p className="text-yellow-400 text-xl font-bold">
            {valorInvestido.toFixed(2)} USDT
          </p>
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
          disabled={loading || bloqueado}
          className={`w-full mt-2 p-2 rounded font-semibold transition ${
            bloqueado
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-yellow-600 hover:bg-yellow-700"
          }`}
        >
          {loading
            ? "Processando..."
            : bloqueado
            ? "Aguardando retorno de 200%"
            : "Investir"}
        </button>

        {bloqueado && (
          <div className="mt-3">
            <p className="text-red-400 text-sm text-center mb-2">
              ⚠ Você só pode investir novamente quando seu investimento ativo dobrar (200%).
            </p>

            {/* 🔥 Barra de progresso animada */}
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-yellow-500 h-4 transition-all duration-700 ease-in-out"
                style={{ width: `${Math.min((progresso / 2) * 100 / 100, 100)}%` }}
              ></div>
            </div>

            <p className="text-center text-sm text-gray-300 mt-1">
              Progresso: {progresso.toFixed(1)}% / 200% <br />
              Falta {falta.toFixed(2)} USDT para liberar novos investimentos.
            </p>
          </div>
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
