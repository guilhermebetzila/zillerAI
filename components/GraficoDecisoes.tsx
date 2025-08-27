"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#ef4444", "#eab308"]; // azul, verde, vermelho, amarelo

export default function GraficoDecisoes() {
  const [data, setData] = useState([
    { name: "Candle", value: 25 },
    { name: "Acertos", value: 35 },
    { name: "Erros", value: 20 },
    { name: "Oportunidades", value: 20 },
  ]);

  // Atualização automática dos valores
  useEffect(() => {
    const interval = setInterval(() => {
      const randomValues = [
        Math.floor(Math.random() * 40) + 10, // Candle
        Math.floor(Math.random() * 40) + 10, // Acertos
        Math.floor(Math.random() * 30) + 5,  // Erros
        Math.floor(Math.random() * 30) + 5,  // Oportunidades
      ];
      const total = randomValues.reduce((a, b) => a + b, 0);
      setData([
        { name: "Candle", value: randomValues[0] },
        { name: "Acertos", value: randomValues[1] },
        { name: "Erros", value: randomValues[2] },
        { name: "Oportunidades", value: randomValues[3] },
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black p-6 rounded-2xl shadow-lg mt-6 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
      {/* Gráfico Donut */}
      <div className="w-full md:w-1/2 h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Lista de Dados ao lado */}
      <div className="w-full md:w-1/2 text-white space-y-3">
        <h2 className="text-lg font-bold text-blue-400 mb-2">📊 Análise de Decisões</h2>
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span>{item.name}</span>
            </span>
            <span className="font-bold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
