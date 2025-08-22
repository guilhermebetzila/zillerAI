"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function GraficoFinanceiro() {
  const [data, setData] = useState([
    { name: "01", valor: 120 },
    { name: "02", valor: 200 },
    { name: "03", valor: 150 },
    { name: "04", valor: 300 },
    { name: "05", valor: 250 },
  ]);

  // Atualiza os valores simulando movimento
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((d) => ({
          ...d,
          valor: Math.floor(Math.random() * 300) + 50,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-black rounded-2xl shadow-lg mt-6">
      {/* Texto com luz verde piscando */}
      <div className="flex items-center space-x-2 mb-4">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-3 h-3 bg-green-400 rounded-full"
        />
        <h2 className="text-green-400 text-lg font-bold">
          Analisando dados financeiros mundiais
        </h2>
      </div>

      {/* Gráfico animado */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#4ade80" />
          <YAxis stroke="#4ade80" />
          <Tooltip />
          <Bar dataKey="valor" fill="#22d3ee" animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
