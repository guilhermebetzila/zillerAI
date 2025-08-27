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
  const [bolsao, setBolsao] = useState(108_456); // valor inicial
  const [capital, setCapital] = useState(0);
  const [zilersAtivos, setZilersAtivos] = useState(0);
  const [lucrosDistribuidos, setLucrosDistribuidos] = useState(0);
  const [lucrosAnimados, setLucrosAnimados] = useState(0); // Para animação

  const caixa1 = 100_000;
  const caixa2 = 100_000;

  // Função para adicionar percentual diário aleatório entre 6% e 8%
  const atualizarBolsaoDiario = () => {
    const percentual = 0.06 + Math.random() * 0.02; // 6% a 8%
    setBolsao(prev => prev + prev * percentual);
  };

  // Função para buscar dados atualizados do servidor
  const fetchBolsao = async () => {
    try {
      const res = await fetch('/api/bolsao');
      if (!res.ok) throw new Error('Erro ao buscar dados');
      const data = await res.json();

      setCapital(data.capitalEmpresa); // capital atualizado do banco
      setZilersAtivos(data.totalUsuarios); // total de usuários cadastrados
      setBolsao(data.bolsaoOperacional); // valor do bolsão do banco

      // Soma todos os rendimentos residuais diários para calcular os lucros distribuídos
      const totalRendimentosResiduais = data.usuarios
        .map((u: any) => u.rendimentoResidualDiario || 0)
        .reduce((acc: number, val: number) => acc + val, 0);

      setLucrosDistribuidos(totalRendimentosResiduais);
    } catch (err) {
      console.error(err);
    }
  };

  // Função para animar os lucros distribuídos
  useEffect(() => {
    const intervaloAnimacao = setInterval(() => {
      setLucrosAnimados(prev => {
        const incremento = (lucrosDistribuidos - prev) * 0.05; // incrementa 5% da diferença
        if (Math.abs(lucrosDistribuidos - prev) < 1) return lucrosDistribuidos;
        return prev + incremento;
      });
    }, 50); // atualiza a cada 50ms

    return () => clearInterval(intervaloAnimacao);
  }, [lucrosDistribuidos]);

  // Função para registrar novo depósito
  const adicionarDeposito = async (valor: number) => {
    try {
      const res = await fetch('/api/deposito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor }),
      });
      if (!res.ok) throw new Error('Erro ao adicionar depósito');
      const data = await res.json();
      setCapital(data.novoCapital); // atualiza capital com o depósito
    } catch (err) {
      console.error(err);
    }
  };

  // Função para registrar saque
  const realizarSaque = async (valor: number) => {
    try {
      const res = await fetch('/api/saque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor }),
      });
      if (!res.ok) throw new Error('Erro ao realizar saque');
      const data = await res.json();
      setCapital(data.novoCapital); // atualiza capital
      setBolsao(data.novoBolsao);   // atualiza bolsão proporcional
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBolsao();

    // Atualiza o Bolsão Operacional uma vez por dia (simulação: 24h em ms)
    const intervaloBolsao = setInterval(atualizarBolsaoDiario, 24 * 60 * 60 * 1000);
    // Atualiza dados do servidor a cada 3 segundos
    const intervaloFetch = setInterval(fetchBolsao, 3000);

    return () => {
      clearInterval(intervaloBolsao);
      clearInterval(intervaloFetch);
    };
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
        <span className="text-sm">Capital próprio acompanhando depósitos, saques e oscilações</span>
      </div>

      <div className="rounded-lg p-6 w-full max-w-xl text-center border-2 border-white">
        <h2 className="text-xl font-semibold mb-2">Zilers Ativos</h2>
        <p className="text-4xl font-bold">{zilersAtivos}</p>
        <span className="text-sm">Total de usuários cadastrados</span>
      </div>

      <div className="rounded-lg p-6 w-full max-w-xl text-center border-2 border-white">
        <h2 className="text-xl font-semibold mb-2">Lucros Distribuídos</h2>
        <p className="text-4xl font-bold">{formatBRL(lucrosAnimados)}</p>
        <span className="text-sm">Lucros distribuídos dos rendimentos residuais diários</span>
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
