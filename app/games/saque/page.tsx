'use client';

import { useState } from "react";
import LayoutWrapper from "../../../components/LayoutWrapper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SaquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [valor, setValor] = useState("");
  const [usdtId, setUsdtId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Redirecionar se não estiver autenticado
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  // Loading enquanto autentica
  if (status === "loading") {
    return (
      <LayoutWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  // Solicitar saque via WhatsApp
  const handleSaque = () => {
    setError(null);

    const valorNumber = Number(valor);
    if (!usdtId) {
      setError("Digite seu ID da Binance.");
      return;
    }
    if (!valor || isNaN(valorNumber) || valorNumber <= 0) {
      setError("Digite um valor válido para saque.");
      return;
    }

    const userId = session?.user?.id || "N/A";
    const nome = session?.user?.name || "Usuário";
    const horario = new Date().toLocaleString("pt-BR");

    const mensagem = `Olá, gostaria de solicitar um saque:%0A%0A🆔 ID: ${userId}%0A👤 Nome: ${nome}%0A💰 Valor: $${valorNumber.toFixed(
      2
    )}%0A🔑 ID Binance: ${usdtId}%0A⏰ Horário: ${horario}`;

    const whatsappUrl = `https://wa.me/5521991146984?text=${mensagem}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <LayoutWrapper>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md text-black">
        <h1 className="text-2xl font-bold mb-4">💵 Saque via USDT</h1>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID da Binance
          </label>
          <input
            type="text"
            value={usdtId}
            onChange={(e) => setUsdtId(e.target.value)}
            placeholder="Digite seu ID da Binance"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor do Saque (USDT)
          </label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Digite o valor do saque"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            min="0"
            step="0.01"
          />
        </div>

        <button
          onClick={handleSaque}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          Solicitar via WhatsApp
        </button>

        <p className="text-xs text-gray-500 mt-3">
          ⚠️ Tempo médio de processamento: até 60 minutos.
        </p>
      </div>
    </LayoutWrapper>
  );
}
