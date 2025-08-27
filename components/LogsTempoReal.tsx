"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const mensagens = [
  "⚡ Taxa de acerto: 87,4% nas últimas 24h",
  "📊 Volume processado: 1.2M dados/segundo",
  "🔄 Operações simultâneas: 3 ativos",
  "🧠 Analisando operações...",
  "💾 Armazenando dados...",
  "📉 Calculando risco...",
  "✅ Estratégia atualizada com sucesso",
  "🔍 Buscando oportunidades no mercado...",
];

export default function LogsTempoReal() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setLogs((prev) => {
        const novosLogs = [...prev, mensagens[i % mensagens.length]];
        // Mantém só os últimos 10 logs rolando
        return novosLogs.slice(-10);
      });
      i++;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-green-400 font-mono p-4 rounded-xl shadow-lg h-64 overflow-y-auto">
      {logs.map((log, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="whitespace-pre"
        >
          {"> "}{log}
        </motion.div>
      ))}
    </div>
  );
}
