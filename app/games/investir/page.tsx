"use client";

import { useState } from "react";

export default function DepositarPage() {
  const [valorPix, setValorPix] = useState<string>("");
  const [valorUSDT, setValorUSDT] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");

  const carteiraUSDT =
    process.env.NEXT_PUBLIC_USDT_WALLET_ADDRESS ||
    "0xc243Ab40A1FA5A48b2512930Fd647640844Cc216";

  const handleGerarPix = async () => {
    const valor = parseFloat(valorPix);
    if (!valor || valor <= 0) {
      alert("Digite um valor válido!");
      return;
    }
    try {
      const res = await fetch("/api/depositos/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert("✅ Pix gerado com sucesso!");
      } else {
        alert(data.error || "Erro ao gerar Pix.");
      }
    } catch (err) {
      alert("❌ Erro de conexão. Tente novamente.");
    }
  };

  const handleVerificarTx = async () => {
    const valor = parseFloat(valorUSDT);
    if (!txHash || !valor || valor <= 0) {
      alert("Preencha os campos corretamente!");
      return;
    }

    try {
      const res = await fetch("/api/depositos/usdt/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash: txHash, valor }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert("✅ Depósito confirmado com sucesso!");
      } else {
        alert(data.error || "Erro ao verificar transação.");
      }
    } catch (err) {
      alert("❌ Erro de conexão. Tente novamente.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold text-center">🎮 Tela de Depósito</h1>
      <p className="text-center text-gray-400">
        Adicione saldo via <b>Pix</b> ou <b>USDT (on-chain)</b>
      </p>

      {/* PIX */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">💰 Depósito via Pix</h2>
        <label className="block mb-2">Valor em R$</label>
        <input
          type="number"
          value={valorPix}
          onChange={(e) => setValorPix(e.target.value)}
          placeholder="Ex: 50.00"
          className="w-full p-2 rounded text-black"
        />
        <button
          onClick={handleGerarPix}
          className="bg-green-600 w-full mt-3 p-2 rounded hover:bg-green-700"
        >
          Gerar Pix
        </button>
      </div>

      {/* USDT */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3">💵 Depósito via USDT</h2>
        <label className="block mb-2">Valor em USDT</label>
        <input
          type="number"
          value={valorUSDT}
          onChange={(e) => setValorUSDT(e.target.value)}
          placeholder="Ex: 10 USDT"
          className="w-full p-2 rounded text-black"
        />

        <p className="mt-3 text-sm">
          Envie para esta carteira:{" "}
          <span className="font-mono text-green-400">{carteiraUSDT}</span>
        </p>

        <label className="block mt-4 mb-2">📌 Hash da Transação</label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Cole a hash da transação"
          className="w-full p-2 rounded text-black"
        />

        <button
          onClick={handleVerificarTx}
          className="bg-blue-600 w-full mt-3 p-2 rounded hover:bg-blue-700"
        >
          Verificar Transação
        </button>
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => window.history.back()}
        className="bg-gray-600 w-full mt-4 p-2 rounded hover:bg-gray-700"
      >
        ⬅ Voltar Ao Perfil
      </button>
    </div>
  );
}
