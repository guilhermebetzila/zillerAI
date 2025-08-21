'use client';

import { useEffect, useState } from "react";

interface AssetData {
  symbol: string;
  price: number;
  updated: string;
  source: string;
}

export default function MarketDemo() {
  const [data, setData] = useState<AssetData | null>(null);

  useEffect(() => {
    // Simula atualização a cada 5 segundos
    const updateMock = () => {
      setData({
        symbol: "USD/BRL",
        price: 5 + Math.random(), // número variando
        updated: new Date().toISOString(),
        source: "Mock",
      });
    };

    updateMock(); // primeira vez
    const interval = setInterval(updateMock, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!data) return <div>Carregando...</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 text-center">
      <h3 className="font-bold">{data.symbol}</h3>
      <p className="text-2xl">{data.price.toFixed(2)}</p>
      <p className="text-xs text-gray-500 mt-2">
        Atualizado: {new Date(data.updated).toLocaleTimeString()}
      </p>
      <p className="text-[10px] text-gray-400">Fonte: {data.source}</p>
    </div>
  );
}
