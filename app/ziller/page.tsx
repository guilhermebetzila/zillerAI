'use client';

import MarketDemo from "@/components/MarketDemo";
import Sidebar from "@/components/Sidebar";
import GraficoFinanceiro from "@/components/GraficoFinanceiro";
import GraficoFundamentalista from "@/components/GraficoFundamentalista";
import GraficoDecisoes from "@/components/GraficoDecisoes";
import GraficoBookOfertas from "@/components/GraficoBookOfertas"; 
import LogsTempoReal from "@/components/LogsTempoReal"; // <-- novo import

export default function ZillerPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-56">
        {/* Cabeçalho */}
        <header className="bg-gray-900 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">📈 Mercado Financeiro</h1>
          <p className="text-gray-300 mt-1">
            Cotação em tempo real do Dólar (USD/BRL) — powered by Ziller.AI
          </p>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Bloco de cotações */}
          <MarketDemo />

          {/* Bloco de calendário econômico */}
          <section>
            <h2 className="text-xl font-bold mb-2">📅 Calendário Econômico</h2>
            <div className="rounded-2xl shadow p-2">
              <iframe
                src="https://s.tradingview.com/embed-widget/events/?locale=br#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A500%2C%22importanceFilter%22%3A%22%22%2C%22currencyFilter%22%3A%22%22%7D"
                style={{
                  width: "100%",
                  height: "500px",
                  border: "none",
                  background: "transparent",
                }}
              />
            </div>
          </section>

          {/* Gráfico financeiro (barras) */}
          <GraficoFinanceiro />

          {/* Gráfico fundamentalista (área) */}
          <GraficoFundamentalista />

          {/* Novo gráfico de decisões (donut chart) */}
          <GraficoDecisoes />

          {/* Novo gráfico de book de ofertas (barras horizontais empilhadas) */}
          <GraficoBookOfertas />

          {/* Logs em tempo real estilo terminal */}
          <section>
            <h2 className="text-xl font-bold mb-2">🖥️ Logs em Tempo Real</h2>
            <LogsTempoReal />
          </section>
        </main>
      </div>
    </div>
  );
}
