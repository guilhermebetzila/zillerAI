'use client';

import { useEffect, useState } from "react";

interface AssetData {
  symbol: string;
  price: number;
}

interface MarketData {
  forex: AssetData;
  stock: AssetData;
  updated: string;
}

export default function MarketDemo() {
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market");
        if (!res.ok) throw new Error("Erro na API");
        const json: MarketData = await res.json();
        setData(json);
      } catch {
        // Fallback simples
        setData({
          forex: { symbol: "USD/BRL", price: 5 },
          stock: { symbol: "AAPL", price: 180 },
          updated: new Date().toISOString(),
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white shadow-lg rounded-lg p-4 text-center">
        <h3 className="font-bold">{data.forex.symbol}</h3>
        <p className="text-2xl">{data.forex.price.toFixed(2)}</p>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-4 text-center">
        <h3 className="font-bold">{data.stock.symbol}</h3>
        <p className="text-2xl">{data.stock.price.toFixed(2)}</p>
      </div>
    </div>
  );
}
