'use client';

import { useState } from "react";
import LayoutWrapper from '@components/LayoutWrapper';
import { useSession } from 'next-auth/react';

export default function SaquePage() {
  const { data: session } = useSession();
  const [valor, setValor] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [respostaEfipay, setRespostaEfipay] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");
    setRespostaEfipay(null);

    if (!valor || Number(valor) <= 0) {
      setMensagem("❌ Informe um valor válido");
      setLoading(false);
      return;
    }
    if (!chavePix.trim()) {
      setMensagem("❌ Informe uma chave PIX válida");
      setLoading(false);
      return;
    }
    if (!session?.user?.id) {
      setMensagem("❌ Usuário não autenticado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/efipay/saque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          valor: Number(valor),
          chavePix: chavePix.trim(),
        }),
      });

      const data = await res.json();
      setRespostaEfipay(data);

      if (res.ok && data.success) {
        setMensagem("✅ Saque PIX enviado com sucesso!");
        setValor("");
        setChavePix("");
      } else if (data.details?.nome === "nao_encontrado") {
        setMensagem("❌ Chave PIX não encontrada na Efipay. Peça para o usuário cadastrar a chave na plataforma Efipay.");
      } else {
        setMensagem(`❌ Erro: ${data.error || data.message || "Falha ao solicitar saque"}`);
      }
    } catch (error: any) {
      setMensagem("❌ Erro inesperado. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Solicitar Saque PIX
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-900 transition"
          >
            {loading ? "Enviando..." : "Solicitar Saque"}
          </button>
        </form>

        {mensagem && <p className="mt-4 text-center text-gray-800 font-medium">{mensagem}</p>}

        {respostaEfipay && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
            <strong>Resposta Efipay (detalhes técnicos):</strong>
            <pre className="overflow-x-auto">{JSON.stringify(respostaEfipay, null, 2)}</pre>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
