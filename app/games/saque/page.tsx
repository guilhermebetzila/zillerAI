"use client";

import { useState, useEffect } from "react";
import LayoutWrapper from "../../../components/LayoutWrapper";

export default function SaquePage() {
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState("pix");
  const [sucesso, setSucesso] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(48 * 60); // 48 minutos em segundos

  // Atualiza o contador regressivo
  useEffect(() => {
    if (!sucesso) return;

    if (tempoRestante <= 0) return;

    const intervalo = setInterval(() => {
      setTempoRestante((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalo);
  }, [sucesso, tempoRestante]);

  // Função para formatar mm:ss
  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleSaque = () => {
    if (!valor || Number(valor) <= 0) {
      alert("Digite um valor válido para sacar.");
      return;
    }

    // Aqui você faria a chamada para sua API de saque
    console.log("Solicitando saque:", { valor, metodo });

    setSucesso(true);
    setTempoRestante(48 * 60); // reinicia a contagem
  };

  return (
    <LayoutWrapper>
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Solicitar Saque</h1>

        {!sucesso ? (
          <>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Digite o valor"
              className="w-full border p-2 rounded mb-4"
            />

            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="pix">Pix</option>
              <option value="banco">Transferência Bancária</option>
            </select>

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
              ✅ Retirada realizada com sucesso!
            </p>
            <p className="text-sm text-gray-600">
              Aguarde a confirmação. Tempo estimado:
            </p>
            <div className="text-3xl font-bold mt-2 text-black">
              {formatarTempo(tempoRestante)}
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
