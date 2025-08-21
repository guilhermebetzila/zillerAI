"use client";
import { useEffect, useState } from "react";

interface AssetData {
  symbol: string;
  price: number;
  updated: string;
  source: string;
}

export default function MarketDemo() {
  const [data, setData] = useState<AssetData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha na API");
        const json: AssetData = await res.json();
        setData(json);
        setError(null);
      } catch (e) {
        setError("Não foi possível carregar a cotação agora.");
      }
    };

    fetchData(); // primeira carga
    const interval = setInterval(fetchData, 10000); // atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) return <div>Carregando...</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 text-center">
      {/* Preço */}
      <p className="text-3xl font-bold text-green-600">
        {data.price.toFixed(2)}
      </p>

      {/* Nome do ativo embaixo */}
      <h3 className="mt-2 text-lg font-semibold text-gray-800">
        {data.symbol}
      </h3>

      {/* Informações adicionais */}
      <p className="text-xs text-gray-500 mt-1">
        Atualizado: {new Date(data.updated).toLocaleTimeString()}
      </p>
      <p className="text-[10px] text-gray-400">Fonte: {data.source}</p>
    </div>
  );
}
