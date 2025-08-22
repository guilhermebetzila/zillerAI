"use client";

import { useEffect, useState } from "react";

export default function RendimentoUsuario() {
  const [rendimento, setRendimento] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRendimento() {
      try {
        const res = await fetch("/api/rendimento/usuario");
        const data = await res.json();
        if (res.ok) {
          setRendimento(Number(data.rendimento));
        } else {
          setRendimento(0);
        }
      } catch (error) {
        console.error("Erro ao carregar rendimento:", error);
        setRendimento(0);
      } finally {
        setLoading(false);
      }
    }

    fetchRendimento();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Carregando rendimento...</p>;
  }

  return (
    <div className="p-4 bg-gray-900 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-white">Rendimento Diário</h2>
      <p className="text-2xl font-bold text-green-500 mt-2">
        {rendimento !== null ? `+ $${rendimento.toFixed(2)}` : "+ $0.00"}
      </p>
    </div>
  );
}
