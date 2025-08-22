'use client';

import { motion } from "framer-motion";
import MarketDemo from "@/components/MarketDemo";
import Sidebar from "@/components/Sidebar";
import GraficoFinanceiro from "@/components/GraficoFinanceiro";
import GraficoFundamentalista from "@/components/GraficoFundamentalista";
import GraficoDecisoes from "@/components/GraficoDecisoes";
import GraficoBookOfertas from "@/components/GraficoBookOfertas";
import LogsTempoReal from "@/components/LogsTempoReal";

export default function ZillerPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar só fixa no desktop */}
      <div className="md:block hidden">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col md:ml-56">
        {/* Cabeçalho */}
        <header className="bg-gray-900 text-white p-3 md:p-4 shadow-md text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold">📈 Mercado Financeiro</h1>
          <p className="text-gray-300 mt-1 text-sm md:text-base">
            Cotação em tempo real do Dólar (USD/BRL) — powered by Ziller.AI
          </p>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 p-3 md:p-8 space-y-6">
          {/* Bloco de cotações */}
          <MarketDemo />

          {/* Calendário Econômico */}
          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2 text-center md:text-left">
              📅 Calendário Econômico
            </h2>
            <div className="rounded-2xl shadow overflow-hidden">
              <iframe
                src="https://s.tradingview.com/embed-widget/events/?locale=br#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A400%2C%22importanceFilter%22%3A%22%22%2C%22currencyFilter%22%3A%22%22%7D"
                style={{
                  width: "100%",
                  height: "400px",
                  border: "none",
                  background: "transparent",
                }}
              />
            </div>
          </section>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GraficoFinanceiro />
            <GraficoFundamentalista />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GraficoDecisoes />
            <GraficoBookOfertas />
          </div>

          {/* Barra Relatório PDF Automático */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm md:text-base">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-xl md:text-2xl"
            >
              📑
            </motion.span>
            <span className="text-center">
              Relatório PDF Automático de Desempenho às{" "}
              <span className="font-bold">20:00h</span>
            </span>
          </div>

          {/* Logs em tempo real */}
          <div className="text-xs md:text-sm">
            <LogsTempoReal />
          </div>
        </main>
      </div>
    </div>
  );
}
