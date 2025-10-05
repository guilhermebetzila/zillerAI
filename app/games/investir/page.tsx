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

type NovoInvestimento = {
  key: number;
  valor: string;
  loading: boolean;
  bloqueado: boolean;
  progresso: number;
  falta: number;
};

export default function InvestimentosPage() {
  const [valorInvestido, setValorInvestido] = useState<number>(0);
  const [bonusResidual, setBonusResidual] = useState<number>(0);
  const [rendimentoDiario, setRendimentoDiario] = useState<number>(0);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [rendimentos, setRendimentos] = useState<Rendimento[]>([]);
  const [novoInvestimentos, setNovoInvestimentos] = useState<NovoInvestimento[]>([]);
  const [saldoTotal, setSaldoTotal] = useState<number>(0);
  const [nextKey, setNextKey] = useState<number>(1);

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
        setSaldoTotal(Number(dataSaldo.saldo ?? 0));
      } else {
        toast.error("Erro ao carregar dados.");
      }
    } catch {
      toast.error("❌ Erro de conexão.");
    }
  };

  const adicionarNovoInvestimento = () => {
    setNovoInvestimentos((prev) => [
      ...prev,
      { key: nextKey, valor: "", loading: false, bloqueado: false, progresso: 0, falta: 0 },
    ]);
    setNextKey((k) => k + 1);
  };

  const handleChangeValor = (key: number, valor: string) => {
    setNovoInvestimentos((prev) =>
      prev.map((inv) => (inv.key === key ? { ...inv, valor } : inv))
    );
  };

  const investir = async (key: number) => {
    const investimento = novoInvestimentos.find((inv) => inv.key === key);
    if (!investimento) return;

    const valorNum = parseFloat(investimento.valor);
    if (!valorNum || valorNum <= 0) {
      toast.error("Digite um valor válido.");
      return;
    }

    if (valorNum > saldoTotal) {
      toast.error("Saldo insuficiente.");
      return;
    }

    setNovoInvestimentos((prev) =>
      prev.map((inv) => (inv.key === key ? { ...inv, loading: true } : inv))
    );

    try {
      const res = await fetch("/api/investir/novo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorNum }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Investimento realizado!");
        setNovoInvestimentos((prev) =>
          prev.map((inv) =>
            inv.key === key
              ? { ...inv, valor: "", loading: false, bloqueado: true, progresso: 0, falta: valorNum * 2 }
              : inv
          )
        );
        carregarDados();
      } else {
        toast.error(data.error || "Erro ao investir.");
        setNovoInvestimentos((prev) =>
          prev.map((inv) => (inv.key === key ? { ...inv, loading: false } : inv))
        );
      }
    } catch {
      toast.error("❌ Erro de conexão.");
      setNovoInvestimentos((prev) =>
        prev.map((inv) => (inv.key === key ? { ...inv, loading: false } : inv))
      );
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 text-white space-y-6">
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

      <div className="flex space-x-4 overflow-x-auto">
        {novoInvestimentos.map((inv) => (
          <div key={inv.key} className="bg-gray-800 p-4 rounded-lg shadow min-w-[250px] flex-shrink-0">
            <label className="block">Valor para investir (USDT)</label>
            <input
              type="number"
              value={inv.valor}
              onChange={(e) => handleChangeValor(inv.key, e.target.value)}
              placeholder="Ex: 100"
              className="w-full p-2 rounded text-black mb-2"
              disabled={inv.bloqueado}
            />
            <button
              onClick={() => investir(inv.key)}
              disabled={inv.loading || inv.bloqueado}
              className={`w-full p-2 rounded font-semibold transition ${
                inv.bloqueado || inv.loading ? "bg-gray-500 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {inv.loading
                ? "Processando..."
                : inv.bloqueado
                ? "Bloqueado até 200%"
                : "Investir"}
            </button>

            {inv.bloqueado && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-4 transition-all duration-700 ease-in-out"
                    style={{ width: `${Math.min(inv.progresso, 100)}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-300 mt-1">
                  {inv.progresso.toFixed(1)}% concluído — falta {inv.falta.toFixed(2)} USDT
                </p>
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center">
          <button
            onClick={adicionarNovoInvestimento}
            className="bg-green-600 hover:bg-green-700 p-2 rounded font-semibold"
          >
            ➕ Novo Investimento
          </button>
        </div>
      </div>

      {/* Investimentos já existentes */}
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">📜 Meus Investimentos</h2>
        {investimentos.length === 0 ? (
          <p className="text-gray-400">Nenhum investimento realizado.</p>
        ) : (
          <ul className="space-y-4">
            {investimentos.map((inv) => {
              const valorBase = parseFloat(inv.valor);
              const acumulado = parseFloat(inv.rendimentoAcumulado);
              const meta = valorBase * 2;
              const progresso = Math.min((acumulado / meta) * 100, 100);
              const falta = Math.max(meta - acumulado, 0);

              return (
                <li key={inv.id} className="bg-gray-700 p-3 rounded">
                  <p>💵 Valor: <span className="text-yellow-400">{valorBase} USDT</span></p>
                  <p>📅 Criado em: {new Date(inv.criadoEm).toLocaleString()}</p>
                  <p>📊 Acumulado: <span className="text-green-400">{acumulado} USDT</span></p>
                  <p>Status: {inv.ativo ? "✅ Ativo" : "❌ Finalizado"}</p>

                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-green-500 h-4 transition-all duration-700 ease-in-out"
                        style={{ width: `${progresso}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-center text-gray-300 mt-1">
                      {progresso.toFixed(1)}% concluído — falta {falta.toFixed(2)} USDT
                    </p>
                  </div>
                </li>
              );
            })}
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
