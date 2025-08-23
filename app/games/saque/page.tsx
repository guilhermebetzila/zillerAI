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
          userId: 1, // ⚠️ Trocar pelo ID do usuário logado (ex: via sessão ou localStorage)
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
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-lg mt-10">
        <h1 className="text-2xl font-bold text-center mb-6">Solicitar Saque</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Método de Saque */}
          <div>
            <label className="block text-sm font-medium mb-1">Método</label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as "PIX" | "USDT")}
              className="w-full border rounded-lg p-2"
            >
              <option value="PIX">PIX</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          {/* Chave PIX */}
          {metodo === "PIX" && (
            <div>
              <label className="block text-sm font-medium mb-1">Chave PIX</label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                required={metodo === "PIX"}
                className="w-full border rounded-lg p-2"
              />
            </div>
          )}

          {/* Carteira USDT */}
          {metodo === "USDT" && (
            <div>
              <label className="block text-sm font-medium mb-1">Carteira USDT (BEP20 ou ERC20)</label>
              <input
                type="text"
                value={carteiraUsdt}
                onChange={(e) => setCarteiraUsdt(e.target.value)}
                required={metodo === "USDT"}
                className="w-full border rounded-lg p-2"
              />
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition"
          >
            {loading ? "Enviando..." : "Solicitar Saque"}
          </button>
        </form>

        {/* Mensagem de Retorno */}
        {mensagem && (
          <p className="mt-4 text-center font-medium">
            {mensagem}
          </p>
        )}
      </div>
    </LayoutWrapper>
  );
}
