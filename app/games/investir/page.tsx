"use client";

import { useState, useEffect } from "react";

interface Investimento {
  id: number;
  valor: number;
  data: string;
  status: string;
}

export default function InvestirPage() {
  const [valor, setValor] = useState<string>("");
  const [historico, setHistorico] = useState<Investimento[]>([]);
  const [loading, setLoading] = useState(false);

  // Buscar histórico de investimentos do usuário
  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const res = await fetch("/api/investimentos");
        const data = await res.json();
        if (res.ok) {
          setHistorico(data);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      }
    };

    fetchHistorico();
  }, []);

  // Função para investir
  const handleInvestir = async () => {
    const valorNum = parseFloat(valor);
    if (!valorNum || valorNum <= 0) {
      alert("Digite um valor válido para investir!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/investimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorNum }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Investimento realizado com sucesso!");
        setValor("");
        setHistorico((prev) => [data, ...prev]); // adiciona o novo investimento ao histórico
      } else {
        alert(data.error || "Erro ao investir.");
      }
    } catch (err) {
      alert("❌ Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold text-center">📈 Tela de Investimento</h1>
      <p className="text-center text-gray-400">
        Invista seu saldo e acompanhe seu histórico.
      </p>

      {/* Formulário de Investimento */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <label className="block mb-2">Valor a Investir (R$)</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: 100.00"
          className="w-full p-2 rounded text-black"
        />
        <button
          onClick={handleInvestir}
          disabled={loading}
          className="bg-green-600 w-full mt-3 p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Processando..." : "Investir"}
        </button>
      </div>

      {/* Histórico */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">📜 Histórico de Investimentos</h2>
        {historico.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum investimento encontrado.</p>
        ) : (
          <ul className="space-y-3">
            {historico.map((inv) => (
              <li
                key={inv.id}
                className="bg-gray-700 p-3 rounded flex justify-between items-center"
              >
                <span>💰 R$ {inv.valor.toFixed(2)}</span>
                <span className="text-sm text-gray-300">{inv.data}</span>
                <span
                  className={`text-sm font-semibold ${
                    inv.status === "aprovado"
                      ? "text-green-400"
                      : inv.status === "pendente"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {inv.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => window.history.back()}
        className="bg-gray-700 w-full mt-6 p-2 rounded-lg font-semibold hover:bg-gray-600 transition"
      >
        ⬅ Voltar ao Perfil
      </button>
    </div>
  );
}
