'use client';
import { useState } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import { useSession } from "next-auth/react";

export default function SaquePage() {
  const { data: session } = useSession();
  const [valor, setValor] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [txId, setTxId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");
    setTxId(null);
    setStatus(null);

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

      if (res.ok) {
        setMensagem("✅ Saque PIX enviado com sucesso!");
        setTxId(data.txId || null);
        setStatus(data.status || null);
        setValor("");
        setChavePix("");
      } else {
        setMensagem(`❌ Erro: ${data.error || "Falha ao solicitar saque"}`);
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
        {txId && <p className="mt-2 text-center text-gray-700 font-medium">TXID: {txId}</p>}
        {status && <p className="mt-2 text-center text-gray-700 font-medium">Status: {status}</p>}
      </div>
    </LayoutWrapper>
  );
}
