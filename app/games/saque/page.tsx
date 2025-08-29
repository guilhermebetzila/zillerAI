"use client";

import { useState } from "react";
import LayoutWrapper from "../../../components/LayoutWrapper";

export default function SaquePage() {
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"pix" | "usdt">("pix");
  const [sucesso, setSucesso] = useState(false);

  const handleSaque = () => {
    if (!valor || Number(valor) <= 0) {
      alert("Digite um valor válido para sacar.");
      return;
    }

    // Aqui você faria a chamada para sua API de saque
    console.log("Solicitando saque:", { valor, metodo });

    setSucesso(true);
  };

  return (
    <LayoutWrapper>
      <div className="bg-white p-6 rounded-2xl shadow-md text-black">
        <h1 className="text-2xl font-bold mb-4">Solicitar Saque</h1>

        {/* Aviso */}
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded mb-4 text-sm">
          Atenção: durante o período de 30 dias, os saques terão prazo de até{" "}
          <span className="font-semibold">60 minutos</span>. 
          A partir de <span className="font-semibold">1º de novembro</span> os saques 
          instantâneos serão restabelecidos.
        </div>

        {!sucesso ? (
          <>
            {/* Abas de cadastro */}
            <div className="flex gap-4 mb-4">
              <button
                className={`flex-1 py-2 rounded-lg border ${
                  metodo === "pix" ? "bg-gray-200 font-bold" : "bg-gray-100"
                }`}
                onClick={() => setMetodo("pix")}
              >
                Cadastrar Pix
              </button>
              <button
                className={`flex-1 py-2 rounded-lg border ${
                  metodo === "usdt" ? "bg-gray-200 font-bold" : "bg-gray-100"
                }`}
                onClick={() => setMetodo("usdt")}
              >
                Cadastrar Carteira BEP-20 (Binance)
              </button>
            </div>

            {/* Valor */}
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Digite o valor"
              className="w-full border p-2 rounded mb-4"
            />

            {/* Botão */}
            <button
              onClick={handleSaque}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Sacar
            </button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600 mb-2">
              🎉 Parabéns! Saque concluído.
            </p>
            <p className="text-sm text-gray-700">
              Em até <span className="font-bold">60 minutos</span> será creditado em sua conta.
            </p>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
