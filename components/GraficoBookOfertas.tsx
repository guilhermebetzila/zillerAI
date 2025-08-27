// components/GraficoBookOfertas.tsx
"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

type Linha = { name: string; compras: number; vendas: number };

const LINHAS_INICIAIS: Linha[] = [
  { name: "NASDAQ", compras: 60, vendas: 40 },
  { name: "Mini Índice", compras: 55, vendas: 45 },
  { name: "Maiores Players", compras: 70, vendas: 30 },
  { name: "S&P Futuro", compras: 50, vendas: 50 },
  { name: "Cripto (BTC)", compras: 65, vendas: 35 },
];

export default function GraficoBookOfertas() {
  const [data, setData] = useState<Linha[]>(LINHAS_INICIAIS);

  // Simula oscilação do book (recalcula compras/vendas mantendo total 100)
  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) =>
        prev.map((l) => {
          const compras = Math.max(10, Math.min(90, Math.floor(l.compras + (Math.random() * 20 - 10))));
          return { ...l, compras, vendas: 100 - compras };
        })
      );
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-black rounded-2xl shadow-lg p-4 mt-6">
      {/* Título */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-blue-400 text-lg font-bold">
          Análise de compras e vendas — book de ofertas • AI (NASDAQ, Mini Índice, Maiores Players)
        </h2>
        {/* indicador sutil animado */}
        <motion.span
          className="w-2.5 h-2.5 rounded-full bg-green-500"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>

      {/* Gráfico de barras horizontais empilhadas */}
      <div className="w-full h-72">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" barCategoryGap={12}>
            <CartesianGrid stroke="#1f2937" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="#60a5fa" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" stroke="#60a5fa" />
            <Tooltip
              contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", borderRadius: 12 }}
              formatter={(v: number) => [`${v}%`, ""]}
            />
            <Legend wrapperStyle={{ color: "#93c5fd" }} />
            <Bar dataKey="compras" stackId="a" fill="#22c55e" animationDuration={1200} />
            <Bar dataKey="vendas" stackId="a" fill="#3b82f6" animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
