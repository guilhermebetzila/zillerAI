'use client';

import React, { useEffect, useState } from 'react';

function formatUSD(valor: number) {
  return valor.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

export default function ICOPagina() {
  const [precoZLR, setPrecoZLR] = useState(0.10); // preço inicial em dólar
  const [tokensDisponiveis, setTokensDisponiveis] = useState(100_000_000); 
  const [tokensVendidos, setTokensVendidos] = useState(0);
  const [capitalCaptado, setCapitalCaptado] = useState(0);
  const [capitalAnimado, setCapitalAnimado] = useState(0);

  // Buscar dados da ICO no backend
  const fetchICO = async () => {
    try {
      const res = await fetch('/api/ico');
      if (!res.ok) throw new Error('Erro ao buscar ICO');
      const data = await res.json();

      setPrecoZLR(data.precoZLR);
      setTokensDisponiveis(data.tokensDisponiveis);
      setTokensVendidos(data.tokensVendidos);
      setCapitalCaptado(data.capitalCaptado);
    } catch (err) {
      console.error(err);
    }
  };

  // Animação para o capital captado
  useEffect(() => {
    const intervalo = setInterval(() => {
      setCapitalAnimado(prev => {
        const incremento = (capitalCaptado - prev) * 0.05;
        if (Math.abs(capitalCaptado - prev) < 1) return capitalCaptado;
        return prev + incremento;
      });
    }, 50);
    return () => clearInterval(intervalo);
  }, [capitalCaptado]);

  // Simulação de compra de tokens
  const comprarTokens = async (quantidade: number) => {
    try {
      const res = await fetch('/api/ico/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantidade }),
      });
      if (!res.ok) throw new Error('Erro na compra');
      const data = await res.json();

      setTokensVendidos(data.tokensVendidos);
      setTokensDisponiveis(data.tokensDisponiveis);
      setCapitalCaptado(data.capitalCaptado);
      alert(`Compra realizada com sucesso! Você adquiriu ${quantidade} ZLR.`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchICO();
    const intervaloFetch = setInterval(fetchICO, 5000);
    return () => clearInterval(intervaloFetch);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-start p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-6">🚀 ICO da Ziller (ZLR)</h1>
      <p className="text-lg text-center max-w-2xl">
        Participe da revolução! Garanta seus tokens <span className="font-bold">ZLR</span> agora
        na fase inicial da ICO e seja parte do futuro da <span className="text-purple-400">Ziller</span>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <div className="rounded-lg p-6 text-center border-2 border-white">
          <h2 className="text-xl font-semibold mb-2">Preço Atual do ZLR</h2>
          <p className="text-3xl font-bold">{formatUSD(precoZLR)}</p>
          <span className="text-sm">Preço por token (em dólar)</span>
        </div>

        <div className="rounded-lg p-6 text-center border-2 border-white">
          <h2 className="text-xl font-semibold mb-2">Tokens Disponíveis</h2>
          <p className="text-3xl font-bold">{tokensDisponiveis.toLocaleString('en-US')}</p>
          <span className="text-sm">Quantidade total para venda</span>
        </div>

        <div className="rounded-lg p-6 text-center border-2 border-white">
          <h2 className="text-xl font-semibold mb-2">Tokens Vendidos</h2>
          <p className="text-3xl font-bold">{tokensVendidos.toLocaleString('en-US')}</p>
          <span className="text-sm">Quantidade já adquirida pelos investidores</span>
        </div>

        <div className="rounded-lg p-6 text-center border-2 border-white">
          <h2 className="text-xl font-semibold mb-2">Capital Captado</h2>
          <p className="text-3xl font-bold">{formatUSD(capitalAnimado)}</p>
          <span className="text-sm">Total levantado na ICO até agora</span>
        </div>
      </div>

      <div className="rounded-lg p-6 w-full max-w-xl text-center border-2 border-purple-500">
        <h3 className="text-xl font-semibold mb-4">💸 Comprar Tokens ZLR</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button
            onClick={() => comprarTokens(100)}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-bold shadow-lg"
          >
            Comprar 100 ZLR
          </button>
          <button
            onClick={() => comprarTokens(500)}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-bold shadow-lg"
          >
            Comprar 500 ZLR
          </button>
          <button
            onClick={() => comprarTokens(1000)}
            className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-bold shadow-lg"
          >
            Comprar 1000 ZLR
          </button>
        </div>
      </div>
    </div>
  );
}
