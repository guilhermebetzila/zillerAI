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

interface MarketDataFromAPI {
  forex: { symbol: string; price: number };
  stock: { symbol: string; price: number };
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

  const renderCard = (
    label: string,
    value: number,
    prevValue: number,
    color: string,
    dataKey: "forex" | "stock"
  ) => {
    const isUp = value >= prevValue;
    return (
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center transition-transform transform hover:scale-105">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold">{label}</span>
          {isUp ? (
            <FaArrowUp className="text-green-500" />
          ) : (
            <FaArrowDown className="text-red-500" />
          )}
        </div>
        <span
          className={`text-2xl font-semibold ${
            isUp ? "text-green-500" : "text-red-500"
          }`}
        >
          {value.toFixed(2)}
        </span>
        <div className="w-full mt-2">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart
              data={history.map((h, i) => ({
                time: new Date(h.updated).toLocaleTimeString(),
                value: h[dataKey].price,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" hide />
              <Tooltip
                formatter={(val: number) => val.toFixed(2)}
                labelFormatter={(label) => `Horário: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const lastHistory = history[history.length - 2] || data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderCard(
        data.forex.symbol,
        data.forex.price,
        lastHistory.forex.price,
        "#FBBF24",
        "forex"
      )}
      {renderCard(
        data.stock.symbol,
        data.stock.price,
        lastHistory.stock.price,
        "#34D399",
        "stock"
      )}
    </div>
  );
}
