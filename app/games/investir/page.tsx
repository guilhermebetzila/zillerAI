"use client";

import { useState } from "react";

export default function DepositoUSDTPage() {
  const [valor, setValor] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleDeposito = async () => {
    const valorNum = parseFloat(valor);
    if (!valorNum || valorNum <= 0) {
      alert("Digite um valor válido!");
      return;
    }
    if (!txHash || txHash.length < 10) {
      alert("Cole o TxHash da sua transação.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/depositos/usdt/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorNum, txHash }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Depósito registrado! Aguarde a confirmação.");
        setValor("");
        setTxHash("");
      } else {
        alert(data.error || "Erro ao registrar depósito.");
      }
    } catch (err) {
      alert("❌ Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold text-center">💵 Depósito em USDT</h1>
      <p className="text-center text-gray-400">
        Envie USDT (BEP-20 / BSC) para a carteira abaixo e cole o TxHash da transação.
      </p>

      {/* Endereço da carteira destino */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center">
        <p className="text-sm text-gray-300 mb-2">Carteira de destino:</p>
        <p className="text-green-400 font-mono break-words">
          {process.env.NEXT_PUBLIC_MAIN_WALLET}
        </p>
      </div>

      {/* Formulário de depósito */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md space-y-3">
        <label className="block">Valor (USDT)</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: 10"
          className="w-full p-2 rounded text-black"
        />

        <label className="block">TxHash da Transação</label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Cole aqui o hash da transação"
          className="w-full p-2 rounded text-black"
        />

        <button
          onClick={handleDeposito}
          disabled={loading}
          className="bg-yellow-600 w-full mt-3 p-2 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? "Processando..." : "Confirmar Depósito"}
        </button>
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => window.history.back()}
        className="bg-gray-700 w-full mt-6 p-2 rounded-lg font-semibold hover:bg-gray-600 transition"
      >
        ⬅ Voltar
      </button>
    </div>
  );
}
