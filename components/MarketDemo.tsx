"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid, XAxis } from "recharts";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface MarketData {
  nasdaq: number;
  miniIndice: number;
  dolar: number;
  time?: string;
}

export default function MarketDemo() {
  const [data, setData] = useState<MarketData>({
    nasdaq: 0,
    miniIndice: 0,
    dolar: 0,
  });

  const [history, setHistory] = useState<MarketData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market");
        if (!res.ok) throw new Error("Erro na API");
        const json = await res.json();
        setData(json);

        setHistory((prev) => {
          const newHistory = [...prev, { ...json, time: new Date().toLocaleTimeString() }];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });
      } catch (err) {
        console.error(err);

        // 🔹 MOCK de dados se API não responder
        const mock = {
          nasdaq: Math.random() * 10000,
          miniIndice: Math.random() * 120000,
          dolar: 4 + Math.random(),
          time: new Date().toLocaleTimeString(),
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

  const renderCard = (
    label: string,
    value: number,
    prevValue: number,
    color: string,
    dataKey: keyof MarketData
  ) => {
    const isUp = value >= prevValue;

    return (
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center transition-transform transform hover:scale-105">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold">{label}</span>
          {isUp ? <FaArrowUp className="text-green-500" /> : <FaArrowDown className="text-red-500" />}
        </div>
        <span className={`text-2xl font-semibold ${isUp ? "text-green-500" : "text-red-500"}`}>
          {value.toFixed(2)}
        </span>
        <div className="w-full mt-2">
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" hide />
              <Tooltip
                formatter={(val: number) => val.toFixed(2)}
                labelFormatter={(label) => `Horário: ${label}`}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {renderCard("Nasdaq", data.nasdaq, lastHistory.nasdaq, "#34D399", "nasdaq")}
      {renderCard("Mini Índice", data.miniIndice, lastHistory.miniIndice, "#60A5FA", "miniIndice")}
      {renderCard("Dólar", data.dolar, lastHistory.dolar, "#FBBF24", "dolar")}
    </div>
  );
}
