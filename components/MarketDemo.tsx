"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
} from "recharts";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface AssetData {
  symbol: string;
  price: number;
}

interface MarketDataFromAPI {
  forex: AssetData;
  stock: AssetData;
  source: string;
  updated: string;
}

export default function MarketDemo() {
  const [data, setData] = useState<MarketDataFromAPI | null>(null);
  const [history, setHistory] = useState<MarketDataFromAPI[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market");
        if (!res.ok) throw new Error("Erro na API");
        const json: MarketDataFromAPI = await res.json();

        setData(json);
        setHistory((prev) => {
          const newHistory = [...prev, json];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
      } catch (err) {
        console.error(err);
        const mock: MarketDataFromAPI = {
          forex: { symbol: "USD/BRL", price: 4 + Math.random() },
          stock: { symbol: "AAPL", price: 150 + Math.random() * 50 },
          source: "Mock",
          updated: new Date().toISOString(),
        };
        setData(mock);
        setHistory((prev) => {
          const newHistory = [...prev, mock];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div>Carregando...</div>;

  // Mapeia os ativos com nome, símbolo, preço, histórico e cor
  const assets = [
    {
      label: "Dólar",
      symbol: data.forex.symbol,
      price: data.forex.price,
      history: history.map((h) => ({
        time: new Date(h.updated).toLocaleTimeString(),
        price: h.forex.price,
      })),
      color: "#FBBF24",
    },
    {
      label: "Apple",
      symbol: data.stock.symbol,
      price: data.stock.price,
      history: history.map((h) => ({
        time: new Date(h.updated).toLocaleTimeString(),
        price: h.stock.price,
      })),
      color: "#34D399",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {assets.map((asset) => {
        const prevPrice =
          asset.history.length > 1
            ? asset.history[asset.history.length - 2].price
            : asset.price;
        const isUp = asset.price >= prevPrice;

        return (
          <div
            key={asset.symbol}
            className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center transition-transform transform hover:scale-105"
          >
            <div className="flex flex-col items-center mb-2">
              <span className="text-sm text-gray-500">{asset.label}</span>
              <span className="font-bold text-lg">{asset.symbol}</span>
            </div>
            <span
              className={`text-2xl font-semibold ${
                isUp ? "text-green-500" : "text-red-500"
              }`}
            >
              {asset.price.toFixed(2)}
            </span>
            <div className="w-full mt-2">
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={asset.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" hide />
                  <Tooltip
                    formatter={(val: number) => val.toFixed(2)}
                    labelFormatter={(label) => `Horário: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={asset.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2">
              {isUp ? (
                <FaArrowUp className="text-green-500" />
              ) : (
                <FaArrowDown className="text-red-500" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
