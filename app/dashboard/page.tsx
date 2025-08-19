'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FaBell, FaRobot } from 'react-icons/fa';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const menuItems = [
  { label: '🤖 IA', action: '/games/ia', img: '/img/ia.png' },
  { label: '📥 Depositar', action: '/games/depositar', img: '/img/2.png' },
  { label: '📤 Saque via Pix', action: '/games/saque', img: '/img/3.png' },
  { label: '📄 Cadastrar CPF', action: '/games/cadastrar-cpf', img: '/img/4.png' },
  { label: '💰 Bolsão da IA', action: '/games/bolsao', img: '/img/5.png' },
  { label: '🎓 Mentoria', action: '/games/mentoria', img: '/img/6.png' },
  { label: '🚪 Sair', action: 'logout', img: '/img/7.png' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [saldo, setSaldo] = useState<number>(0);
  const [valorInvestido, setValorInvestido] = useState<number>(0);
  const [rendimentoDiario, setRendimentoDiario] = useState<number>(0);
  const [totalIndicados, setTotalIndicados] = useState<number>(0);
  const [pontos, setPontos] = useState<number>(0);
  const [pontosDiretos, setPontosDiretos] = useState<number>(0);
  const [pontosIndiretos, setPontosIndiretos] = useState<number>(0);

  const user = session?.user;

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/saldo`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setSaldo(data.saldo || 0);
          setValorInvestido(data.valorInvestido || 0);
          setRendimentoDiario(data.rendimentoDiario || 0);
          setTotalIndicados(data.totalIndicados || 0);
          setPontos(data.pontos || 0);
          setPontosDiretos(data.pontosDiretos || 0);
          setPontosIndiretos(data.pontosIndiretos || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };

    if (user) fetchUsuario();
  }, [user]);

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.action === 'logout') {
      signOut({ callbackUrl: '/login' });
    } else if (item.action) {
      router.push(item.action);
    }
  };

  const progresso = Math.min((pontos / 1000) * 100, 100);
  const codigoIndicacao = user?.id || user?.email || '';
  const linkIndicacao = `https://www.ziller.club/register?indicador=${encodeURIComponent(
    codigoIndicacao
  )}`;

  if (status === 'loading')
    return <p className="text-center mt-10 text-white">Carregando...</p>;
  if (status === 'unauthenticated')
    return (
      <p className="text-center mt-10 text-red-500">
        Acesso negado. Faça login para continuar.
      </p>
    );

  return (
    <LayoutWrapper>
      <div className="min-h-screen px-4 py-4 text-white relative">
        {/* Barra superior */}
        <div className="flex justify-end items-center mb-6 max-w-6xl mx-auto gap-4">
          <button className="px-4 py-2 border border-white rounded-lg text-white flex items-center gap-2">
            <FaRobot /> Atendimento
          </button>
          <button className="px-4 py-2 border border-white rounded-lg text-white flex items-center gap-2">
            <FaBell /> Notificações
          </button>
        </div>

        {/* Menu horizontal */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-4 px-2 py-4">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleMenuClick(item)}
                className="flex-shrink-0 w-20 h-20 rounded-full border-2 border-white overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Painel do usuário */}
        <div className="mb-6 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-4">
            Olá, {user?.nome || user?.email}
            <span className="bg-black text-white px-3 py-1 text-sm rounded shadow-sm font-semibold">
              Saldo: {saldo.toFixed(2)} USDT
            </span>
          </h1>
          <p className="text-white text-sm mt-1">
            Valor investido: {valorInvestido.toFixed(2)} USDT
          </p>
          <p className="text-green-400 text-sm mt-1">
            Rendimento diário: {rendimentoDiario.toFixed(2)} USDT
            <span className="text-xs text-white ml-2">(Atualizado às 10h)</span>
          </p>
          <p className="text-white mt-2">
            Você já indicou <strong>{totalIndicados}</strong> pessoa(s)!
          </p>

          {/* Barra de pontos */}
          <div className="mt-4">
            <p className="text-white text-sm mb-1">
              Pontos Acumulados: {pontos} pontos
            </p>
            <p className="text-white text-xs mb-1">
              Diretos: {pontosDiretos} | Indiretos: {pontosIndiretos}
            </p>
            <div className="w-full bg-white/20 rounded-full h-4">
              <div
                className="bg-white h-4 rounded-full"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
            <p className="text-white text-xs mt-1">
              Você precisa de 1000 pontos para desbloquear o próximo prêmio
            </p>
          </div>

          {/* Código de indicação */}
          <div className="mt-6 bg-black/20 rounded-lg p-4 border border-white shadow-md">
            <h3 className="text-white text-sm font-semibold mb-2">
              Seu Código de Indicação:
            </h3>
            <div className="flex items-center justify-between bg-black/10 text-white px-3 py-2 rounded-md font-mono text-sm border border-white">
              <a
                href={linkIndicacao}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate underline hover:text-green-400"
              >
                {linkIndicacao}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(linkIndicacao)}
                className="ml-4 bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1 rounded transition-colors text-xs"
              >
                Copiar
              </button>
            </div>
            <p className="text-white text-xs mt-1">
              Compartilhe este link com amigos e ganhe bônus por cada novo Ziler
              indicado.
            </p>
          </div>
        </div>

        {/* Bloco de informações profissionais da empresa */}
        <div className="mb-8">
          <h3 className="text-lg text-center text-white font-semibold mb-3">
            Informações da Empresa
          </h3>
          <div className="flex flex-col gap-2 px-2 py-4 border-t border-b border-white/20 text-sm text-white">
            <p>📌 CNPJ: 12.345.678/0001-99</p>
            <p>📧 E-mail: contato@ziller.club</p>
            <p>📱 WhatsApp: (11) 99999-9999</p>
            <p>🌐 Site Oficial: www.ziller.club</p>
            <p>📸 Instagram: @ziller.club</p>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => router.push('/games/investir')}
            className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all text-base"
          >
            Investir Agora
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full mt-20 text-white py-12 px-6 border-t border-white/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              Segurança & Confiança
            </h3>
            <p className="text-white text-sm mb-2">
              Auditoria independente concluída com sucesso.
            </p>
            <p className="text-white text-sm mb-2">
              IA operando com precisão validada de 87,9%.
            </p>
            <p className="text-white text-sm">
              Certificados e parcerias disponíveis no painel.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              Transparência Total
            </h3>
            <p className="text-white text-sm mb-2">
              Painel de controle com histórico completo.
            </p>
            <p className="text-white text-sm mb-2">
              Saque e depósito via Pix 100% transparente.
            </p>
            <p className="text-white text-sm">
              Controle total do seu investimento, em tempo real.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">
              Comunidade Ziler
            </h3>
            <p className="text-white text-sm mb-2">
              Top 10 Zilers com maiores ganhos do mês.
            </p>
            <p className="text-white text-sm mb-2">
              Missão: Pagar dívidas, viver de renda, transformar vidas.
            </p>
            <p className="text-white text-sm">
              Você é o protagonista dessa revolução financeira.
            </p>
          </div>
        </div>
        <div className="text-center mt-12 text-white text-sm">
          © {new Date().getFullYear()} Ziller.Ia • Todos os direitos reservados
        </div>
      </footer>
    </LayoutWrapper>
  );
}
