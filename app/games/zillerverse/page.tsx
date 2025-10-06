'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Evento {
  id: number;
  descricao: string;
  opcoes: string[];
  impacto: number[];
  tempoLimite: number;
}

interface Decisao {
  descricao: string;
  escolha: string;
  pontos: number;
}

interface Avatar {
  nome: string;
  descricao: string;
  perfil: string;
}

const avatares: Avatar[] = [
  { nome: 'Conservador', descricao: 'Minimiza riscos, foca em estabilidade', perfil: 'Conservador' },
  { nome: 'Trader', descricao: 'Busca lucros rápidos com decisões agressivas', perfil: 'Trader Agressivo' },
  { nome: 'Empreendedor', descricao: 'Cria oportunidades e expande negócios', perfil: 'Empreendedor' },
  { nome: 'Analista', descricao: 'Toma decisões baseadas em dados', perfil: 'Analista' },
];

const eventosBase: Evento[] = [
  {
    id: 1,
    descricao: "O Banco Central cortou juros. Sua startup deve expandir ou comprar dólar?",
    opcoes: ["Investir em expansão", "Comprar dólar"],
    impacto: [50, 30],
    tempoLimite: 60,
  },
  {
    id: 2,
    descricao: "BTC disparou 20%. Você é trader agressivo: vende ou segura?",
    opcoes: ["Vender agora", "Segurar"],
    impacto: [40, 60],
    tempoLimite: 45,
  },
  {
    id: 3,
    descricao: "Curso de finanças com alta procura. Aumenta preço ou mantém?",
    opcoes: ["Aumentar preço", "Manter preço"],
    impacto: [30, 50],
    tempoLimite: 30,
  },
];

export default function ZillerversePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [avatarSelecionado, setAvatarSelecionado] = useState<Avatar | null>(null);
  const [eventoAtual, setEventoAtual] = useState<Evento | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [reputacao, setReputacao] = useState<number>(0);
  const [decisaoTomada, setDecisaoTomada] = useState<boolean>(false);
  const [resultado, setResultado] = useState<string>('');
  const [historico, setHistorico] = useState<Decisao[]>([]);
  const [ranking, setRanking] = useState<{nome: string, pontos: number}[]>([]);

  useEffect(() => {
    if (status !== 'authenticated') {
      router.push('/auth/login');
      return;
    }
    setRanking([
      {nome: 'Alice', pontos: 320},
      {nome: 'Bob', pontos: 280},
      {nome: 'Você', pontos: reputacao},
    ]);
  }, [status]);

  useEffect(() => {
    if (timer <= 0 || decisaoTomada) return;
    const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, decisaoTomada]);

  const iniciarEvento = () => {
    const evento = eventosBase[Math.floor(Math.random() * eventosBase.length)];
    setEventoAtual(evento);
    setTimer(evento.tempoLimite);
    setDecisaoTomada(false);
    setResultado('');
  };

  const selecionarAvatar = (avatar: Avatar) => {
    setAvatarSelecionado(avatar);
    toast(`Avatar "${avatar.nome}" selecionado!`);
    iniciarEvento();
  };

  const tomarDecisao = (opcaoIndex: number) => {
    if (!eventoAtual) return;
    const pontosGanho = eventoAtual.impacto[opcaoIndex];
    setReputacao(prev => prev + pontosGanho);
    setHistorico(prev => [...prev, {
      descricao: eventoAtual.descricao,
      escolha: eventoAtual.opcoes[opcaoIndex],
      pontos: pontosGanho
    }]);
    setResultado(`Você escolheu "${eventoAtual.opcoes[opcaoIndex]}" e ganhou ${pontosGanho} pontos!`);
    setDecisaoTomada(true);
    toast.success(`+${pontosGanho} pontos!`);
    setRanking(prev => prev.map(r => r.nome === 'Você' ? {nome: 'Você', pontos: reputacao + pontosGanho} : r));
  };

  if (status === 'loading') {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!avatarSelecionado) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-white">
          <h1 className="text-3xl font-bold mb-4 text-center">Escolha seu Avatar Financeiro</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
            {avatares.map((a, idx) => (
              <button key={idx} onClick={() => selecionarAvatar(a)}
                className="bg-gray-800 p-4 rounded-2xl shadow-md hover:bg-green-600 transition text-left">
                <h2 className="font-semibold text-xl">{a.nome}</h2>
                <p className="text-sm mt-2">{a.descricao}</p>
              </button>
            ))}
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen flex flex-col px-4 py-6 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-2 text-center">🪐 Zillerverse</h1>
        <p className="text-center mb-6 max-w-xl mx-auto">
          Avatar: <strong>{avatarSelecionado.nome}</strong> — {avatarSelecionado.descricao}
        </p>

        <div className="flex-1 overflow-y-auto">
          {eventoAtual && (
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-6 w-full max-w-xl mx-auto">
              <p className="mb-4 font-semibold">{eventoAtual.descricao}</p>
              <p className="text-sm mb-4">Tempo restante: {timer}s</p>
              <div className="flex flex-col gap-3">
                {eventoAtual.opcoes.map((opcao, idx) => (
                  <button key={idx}
                    disabled={decisaoTomada || timer <= 0}
                    onClick={() => tomarDecisao(idx)}
                    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl disabled:bg-gray-500 disabled:cursor-not-allowed transition"
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </div>
          )}

          {resultado && (
            <div className="bg-white/10 p-4 rounded-2xl shadow-md mb-6 w-full max-w-xl mx-auto text-center">
              {resultado}
            </div>
          )}

          <div className="bg-gray-800 p-4 rounded-2xl shadow-md w-full max-w-xl mx-auto mb-6 text-center">
            <p className="font-semibold mb-2">🌟 Pontos de Reputação: {reputacao}</p>
            <div className="w-full bg-white/20 rounded-xl h-4">
              <div
                className="bg-green-500 h-4 rounded-xl transition-all duration-500"
                style={{ width: `${Math.min((reputacao / 500) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-2xl shadow-md w-full max-w-xl mx-auto mb-6">
            <h3 className="font-semibold mb-2">📜 Histórico de Decisões</h3>
            {historico.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhuma decisão ainda.</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {historico.map((h, idx) => (
                  <li key={idx} className="flex justify-between bg-gray-700 p-2 rounded-xl">
                    <span className="text-sm">{h.descricao}</span>
                    <span className="text-sm text-green-400">+{h.pontos}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded-2xl shadow-md w-full max-w-xl mx-auto mb-6">
            <h3 className="font-semibold mb-2">🏆 Ranking Global</h3>
            <ul className="space-y-2">
              {ranking.map((r, idx) => (
                <li key={idx} className={`flex justify-between p-2 rounded-xl ${r.nome === 'Você' ? 'bg-green-600' : 'bg-gray-700'}`}>
                  <span>{idx + 1}. {r.nome}</span>
                  <span>{r.pontos}</span>
                </li>
              ))}
            </ul>
          </div>

          {decisaoTomada && (
            <button
              onClick={iniciarEvento}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl transition w-full max-w-xl mx-auto mb-6"
            >
              Próximo Evento
            </button>
          )}

          <p className="mt-6 text-xs text-gray-400 max-w-xl mx-auto text-center">
            Zillerverse combina decisões simuladas com dados de mercado real para treinar sua estratégia financeira.
          </p>
        </div>
      </div>
    </LayoutWrapper>
  );
}
