// app/demos/page.tsx
import MarketDemo from "@/components/MarketDemo";
import Sidebar from "@/components/Sidebar";

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar fixa (já faz mobile + desktop) */}
      <Sidebar />

      {/* Conteúdo principal com margem no desktop */}
      <div className="flex-1 flex flex-col md:ml-56">
        {/* Cabeçalho */}
        <header className="bg-gray-900 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">📈 Mercado Financeiro</h1>
          <p className="text-gray-300 mt-1">
            Visualize Nasdaq, Mini Índice e Dólar em tempo real. Ziller.AI
          </p>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-4 md:p-8">
          <MarketDemo />
        </main>
      </div>
    </div>
  );
}
