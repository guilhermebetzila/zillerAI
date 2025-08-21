"use client";

import { useEffect, useState } from "react";

interface AssetData {
  symbol: string;
  price: number;
  source: string;
}

interface MarketResponse {
  updated: string;
  assets: AssetData[];
}

export default function MarketDemo() {
  const [data, setData] = useState<MarketResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha na API");
        const json: MarketResponse = await res.json();
        setData(json);
        setError(null);
      } catch (e) {
        setError("Não foi possível carregar as cotações agora.");
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.assets.map((asset) => (
        <div
          key={asset.symbol}
          className="bg-white shadow-lg rounded-lg p-4 text-center"
        >
          {/* Preço */}
          <p className="text-3xl font-bold text-green-600">
            R$ {asset.price.toFixed(2)}
          </p>

          {/* Nome do ativo */}
          <h3 className="mt-2 text-lg font-semibold text-gray-800">
            {asset.symbol}
          </h3>

          {/* Informações adicionais */}
          <p className="text-xs text-gray-500 mt-1">
            Atualizado: {new Date(data.updated).toLocaleTimeString()}
          </p>
          <p className="text-[10px] text-gray-400">Fonte: {asset.source}</p>
        </div>
      ))}
    </div>
  );
}
