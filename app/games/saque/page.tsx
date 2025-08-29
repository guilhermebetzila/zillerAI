"use client";

import { useState, useEffect } from "react";
import LayoutWrapper from "../../../components/LayoutWrapper";
import axios from "axios";

export default function SaquePage() {
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState<"pix" | "usdt">("pix");
  const [sucesso, setSucesso] = useState(false);
  const [pix, setPix] = useState("");
  const [usdt, setUsdt] = useState("");
  const [saldo, setSaldo] = useState(0);

  // Buscar saldo do usuário ao carregar
  useEffect(() => {
    async function fetchSaldo() {
      try {
        const res = await axios.get("/api/usuario/saldo"); // ajuste a rota conforme seu backend
        setSaldo(res.data.saldo);
      } catch (err) {
        console.error("Erro ao buscar saldo:", err);
      }
    }
    fetchSaldo();
  }, []);

  const handleSalvarMetodo = async () => {
    try {
      if (metodo === "pix" && !pix) {
        alert("Digite sua chave Pix.");
        return;
      }
      if (metodo === "usdt" && !usdt) {
        alert("Digite sua carteira USDT (BEP-20).");
        return;
      }

      await axios.post("/api/usuario/cadastrar-metodo", {
        metodo,
        valor: metodo === "pix" ? pix : usdt,
      });

      alert(`${metodo.toUpperCase()} cadastrado com sucesso!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar método de saque.");
    }
  };

  const handleSaque = async () => {
    if (!valor || Number(valor) <= 0) {
      alert("Digite um valor válido para sacar.");
      return;
    }

    if (Number(valor) > saldo) {
      alert("Você não possui saldo suficiente para esse saque.");
      return;
    }

    try {
      await axios.post("/api/saque", { valor: Number(valor), metodo });
      setSucesso(true);
      setSaldo((prev) => prev - Number(valor));
    } catch (err) {
      console.error(err);
      alert("Erro ao solicitar saque.");
    }
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

            {/* Campos de cadastro */}
            {metodo === "pix" ? (
              <div className="mb-4">
                <input
                  type="text"
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  placeholder="Digite sua chave Pix"
                  className="w-full border p-2 rounded mb-2"
                />
                <button
                  onClick={handleSalvarMetodo}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Salvar Pix
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <input
                  type="text"
                  value={usdt}
                  onChange={(e) => setUsdt(e.target.value)}
                  placeholder="Digite sua carteira USDT (BEP-20)"
                  className="w-full border p-2 rounded mb-2"
                />
                <button
                  onClick={handleSalvarMetodo}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Salvar USDT
                </button>
              </div>
            )}

            {/* Valor */}
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={`Digite o valor (saldo disponível: R$${saldo.toFixed(2)})`}
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
