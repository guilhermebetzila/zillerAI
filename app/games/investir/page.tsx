"use client";

import { useEffect, useState } from "react";

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
  const [saldo, setSaldo] = useState<string>("0");
  const [valorInvestido, setValorInvestido] = useState<string>("0");
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [rendimentos, setRendimentos] = useState<Rendimento[]>([]);
  const [novoValor, setNovoValor] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Carregar dados do usuário
  const carregarDados = async () => {
    try {
      const res = await fetch("/api/investir"); // ✅ rota corrigida
      const data = await res.json();
      if (res.ok) {
        setSaldo(data.saldo);
        setValorInvestido(data.valorInvestido);
        setInvestimentos(data.investimentos);
        setRendimentos(data.rendimentos);
      } else {
        alert(data.error || "Erro ao carregar dados.");
      }
    } catch (err) {
      alert("❌ Erro de conexão.");
    }
  };

  // Criar novo investimento
  const investir = async () => {
    const valorNum = parseFloat(novoValor);
    if (!valorNum || valorNum <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/investir/novo", { // ✅ rota corrigida
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorNum }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Investimento realizado!");
        setNovoValor("");
        carregarDados(); // recarregar lista
      } else {
        alert(data.error || "Erro ao investir.");
      }
    } catch (err) {
      alert("❌ Erro de conexão.");
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

      {/* Saldo e Investido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Saldo Atual</p>
          <p className="text-green-400 text-xl font-bold">{saldo} USDT</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-gray-400">Total Investido</p>
          <p className="text-yellow-400 text-xl font-bold">{valorInvestido} USDT</p>
        </div>
      </div>

      {/* Novo Investimento */}
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

      {/* Histórico de Investimentos */}
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">📜 Meus Investimentos</h2>
        {investimentos.length === 0 ? (
          <p className="text-gray-400">Nenhum investimento realizado.</p>
        ) : (
          <ul className="space-y-2">
            {investimentos.map((inv) => (
              <li key={inv.id} className="bg-gray-700 p-3 rounded">
                <p>
                  💵 Valor:{" "}
                  <span className="text-yellow-400">{inv.valor} USDT</span>
                </p>
                <p>📅 Criado em: {new Date(inv.criadoEm).toLocaleString()}</p>
                <p>
                  📊 Acumulado:{" "}
                  <span className="text-green-400">
                    {inv.rendimentoAcumulado} USDT
                  </span>
                </p>
                <p>Status: {inv.ativo ? "✅ Ativo" : "❌ Finalizado"}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Histórico de Rendimentos */}
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
                <p>📈 Taxa: {parseFloat(r.rate) * 100}%</p>
                <p className="text-green-400">+ {r.amount} USDT</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Voltar */}
      <button
        onClick={() => window.history.back()}
        className="bg-gray-700 w-full mt-6 p-2 rounded-lg font-semibold hover:bg-gray-600 transition"
      >
        ⬅ Voltar
      </button>
    </div>
  );
}
