"use client";

import { useState } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";

export default function SaquePage() {
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"PIX" | "USDT">("PIX");
  const [chavePix, setChavePix] = useState("");
  const [carteiraUsdt, setCarteiraUsdt] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    try {
      const res = await fetch("/api/saque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          valor,
          metodo,
          chavePix: metodo === "PIX" ? chavePix : null,
          carteiraUsdt: metodo === "USDT" ? carteiraUsdt : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMensagem("✅ Pedido de saque enviado com sucesso!");
        setValor("");
        setChavePix("");
        setCarteiraUsdt("");
      } else {
        setMensagem(`❌ Erro: ${data.error || "Falha ao solicitar saque"}`);
      }
    } catch (error) {
      setMensagem("❌ Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        {/* Título */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Solicitar Saque
        </h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Valor */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Valor (R$)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Digite o valor do saque"
            />
          </div>

          {/* Método */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Método de Saque</label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as "PIX" | "USDT")}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              <option value="PIX">PIX</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          {/* Chave PIX */}
          {metodo === "PIX" && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Chave PIX</label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                placeholder="Digite sua chave PIX"
              />
            </div>
          )}

          {/* Carteira USDT */}
          {metodo === "USDT" && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Carteira USDT (BEP20 ou ERC20)</label>
              <input
                type="text"
                value={carteiraUsdt}
                onChange={(e) => setCarteiraUsdt(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                placeholder="Digite sua carteira USDT"
              />
            </div>
          )}

          {/* Botão de enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-900 transition"
          >
            {loading ? "Enviando..." : "Solicitar Saque"}
          </button>
        </form>

        {/* Mensagem de retorno */}
        {mensagem && (
          <p className="mt-4 text-center text-gray-800 font-medium">{mensagem}</p>
        )}
      </div>
    </LayoutWrapper>
  );
}
