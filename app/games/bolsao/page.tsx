'use client';

import React, { useEffect, useState } from 'react';

function formatBRL(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export default function BolsaoPage() {
  const [bolsao, setBolsao] = useState(0);
  const [capital, setCapital] = useState(0);
  const [zilersAtivos, setZilersAtivos] = useState(0);
  const [lucrosDistribuidos, setLucrosDistribuidos] = useState(0);

  const caixa1 = 100_000;
  const caixa2 = 100_000;

  const fetchBolsao = async () => {
    try {
      const res = await fetch('/api/bolsao');
      if (!res.ok) throw new Error('Erro ao buscar dados');
      const data = await res.json();
      setBolsao(data.bolsaoOperacional);
      setCapital(data.capitalEmpresa);
      setZilersAtivos(data.zilersAtivos);
      setLucrosDistribuidos(data.lucrosDistribuidos);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBolsao();
    const interval = setInterval(fetchBolsao, 3000); // atualizar a cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-start p-6 space-y-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Bolsão da Inteligência Artificial</h1>

      <div className="rounded-lg p-6 w-full max-w-xl text-center border-2 border-white">
        <h2 className="text-xl font-semibold mb-2">Bolsão Operacional</h2>
        <p className="text-4xl font-bold">{formatBRL(bolsao)}</p>
        <span className="text-sm">Valor total em operações de mercado</span>
      </div>

      <div className="rounded-lg p-6 w-full max-w-xl text-center border-2 border-white">
        <h2 className="text-xl font-semibold mb-2">Capital da Empresa</h2>
        <p className="text-4xl font-bold">{formatBRL(capital)}</p>
        <span className="text-sm">Capital próprio acompanhando as oscilações</span>
      </div>

      <div className="rounded-lg p-6 w-full max-w-xl text-center border-2 border-white">
        <h2 className="text-xl font-semibold mb-2">Zilers Ativos</h2>
        <p className="text-4xl font-bold">{zilersAtivos}</p>
        <span className="text-sm">Usuários ativos atualmente</span>
      </div>

      <div className="rounded-lg p-6 w-full max-w-xl text-center border-2 border-white">
        <h2 className="text-xl font-semibold mb-2">Lucros Distribuídos</h2>
        <p className="text-4xl font-bold">{formatBRL(lucrosDistribuidos)}</p>
        <span className="text-sm">Lucros distribuídos aos Zilers</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <div className="rounded-lg p-6 text-center border-2 border-white">
          <h3 className="text-lg font-semibold mb-2">Caixa de Proteção 1</h3>
          <p className="text-3xl font-bold">{formatBRL(caixa1)}</p>
        </div>
        <div className="rounded-lg p-6 text-center border-2 border-white">
          <h3 className="text-lg font-semibold mb-2">Caixa de Proteção 2</h3>
          <p className="text-3xl font-bold">{formatBRL(caixa2)}</p>
        </div>
      </div>
    </div>
  );
}
