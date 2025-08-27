"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function GraficoFundamentalista() {
  const [data, setData] = useState([
    { name: "01", valor: 100 },
    { name: "02", valor: 200 },
    { name: "03", valor: 150 },
    { name: "04", valor: 250 },
    { name: "05", valor: 300 },
  ]);

  // Simula oscilações automáticas
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((d) => ({
          ...d,
          valor: Math.floor(Math.random() * 300) + 50,
        }))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-black rounded-2xl shadow-lg mt-6">
      {/* Título com indicador verde piscando */}
      <div className="flex items-center space-x-3 mb-4">
        <h2 className="text-blue-400 text-lg font-bold">
          Análises fundamentalistas empresariais
        </h2>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-4 h-4 rounded-full bg-green-500 shadow-lg"
        />
      </div>

      {/* Gráfico de área animado */}
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <XAxis dataKey="name" stroke="#60a5fa" />
          <YAxis stroke="#60a5fa" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="#22d3ee"
            fill="#22d3ee"
            fillOpacity={0.3}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
