'use client';

import { useState } from "react";
import LayoutWrapper from "../../../components/LayoutWrapper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SaquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"pix" | "usdt">("pix");
  const [pix, setPix] = useState("");
  const [usdt, setUsdt] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Redirecionar se não estiver autenticado
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  // Se não estiver autenticado, mostra loading
  if (status === "loading") {
    return (
      <LayoutWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  // Salvar chave PIX/USDT localmente
  const salvarChave = () => {
    if (metodo === "pix" && pix) {
      setMensagemSucesso("✅ Chave PIX salva com sucesso!");
    } else if (metodo === "usdt" && usdt) {
      setMensagemSucesso("✅ Carteira USDT salva com sucesso!");
    } else {
      setMensagemSucesso("⚠️ Digite uma chave/carteira válida.");
    }
    setTimeout(() => setMensagemSucesso(""), 3000); // some após 3s
  };

  // Solicitar saque (abre WhatsApp)
  const handleSaque = () => {
    setError(null);

    const valorNumber = Number(valor);
    if (!valor || isNaN(valorNumber) || valorNumber <= 0) {
      setError("Digite um valor válido para sacar.");
      return;
    }

    const chaveAtual = metodo === "pix" ? pix : usdt;
    if (!chaveAtual) {
      setError(`Cadastre uma chave ${metodo.toUpperCase()} antes de solicitar o saque.`);
      return;
    }

    const userId = session?.user?.id || "N/A";
    const nome = session?.user?.name || "Usuário";
    const horario = new Date().toLocaleString("pt-BR");

    const mensagem = `Olá, gostaria de solicitar um saque:%0A%0A🆔 ID: ${userId}%0A👤 Nome: ${nome}%0A💰 Valor: R$ ${valorNumber.toFixed(
      2
    )}%0A🏦 Método: ${metodo.toUpperCase()}%0A🔑 Chave: ${chaveAtual}%0A⏰ Horário: ${horario}%0A⏳ Prazo: até 60 minutos`;

    const whatsappUrl = `https://wa.me/5521991146984?text=${mensagem}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <LayoutWrapper>
      <div className="max-w-2xl mx-auto mt-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-md text-black">
          <h1 className="text-2xl font-bold mb-4">Solicitar Saque</h1>

          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded mb-4 text-sm">
            Atenção: saques podem levar até{" "}
            <span className="font-semibold">60 minutos</span>.
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {mensagemSucesso && (
            <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded mb-4 text-sm">
              {mensagemSucesso}
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <button
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                metodo === "pix"
                  ? "bg-blue-100 border-blue-400 font-bold text-blue-800"
                  : "bg-gray-100 border-gray-300"
              }`}
              onClick={() => setMetodo("pix")}
            >
              Usar Pix
            </button>
            <button
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                metodo === "usdt"
                  ? "bg-blue-100 border-blue-400 font-bold text-blue-800"
                  : "bg-gray-100 border-gray-300"
              }`}
              onClick={() => setMetodo("usdt")}
            >
              Usar USDT
            </button>
          </div>

          {/* Input da chave PIX/USDT */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {metodo === "pix" ? "Chave PIX" : "Carteira USDT"}
            </label>
            <input
              type="text"
              value={metodo === "pix" ? pix : usdt}
              onChange={(e) =>
                metodo === "pix" ? setPix(e.target.value) : setUsdt(e.target.value)
              }
              placeholder={
                metodo === "pix" ? "Digite sua chave PIX" : "Digite sua carteira USDT"
              }
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={salvarChave}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Salvar {metodo === "pix" ? "PIX" : "USDT"}
            </button>
          </div>

          {/* Input valor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Saque
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Digite o valor do saque"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        </div>
      </div>
    </LayoutWrapper>
  );
}
