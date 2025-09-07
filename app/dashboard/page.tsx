'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/accordion";
import { ChevronDown, Bell, Home, User, Wallet, Settings } from "lucide-react";

interface MenuItem {
  label: string;
  action: string;
  img: string;
}

const menuItems: MenuItem[] = [
  { label: '🤖 IA', action: '/games/ia', img: '/img/ia.png' },
  { label: '📥 Depositar', action: '/games/depositar', img: '/img/2.png' },
  { label: '📤 Saque via Pix', action: '/games/saque', img: '/img/3.png' },
  { label: '📄 Cadastrar CPF', action: '/games/cadastrar-cpf', img: '/img/4.png' },
  { label: '💰 Bolsão da IA', action: '/games/bolsao', img: '/img/5.png' },
  { label: '🎓 Mentoria', action: '/games/mentoria', img: '/img/6.png' },
  { label: '🚪 Sair', action: 'logout', img: '/img/7.png' },
];

const PONTOS_OBJETIVO = 1000;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const codigoIndicacao = user?.id || user?.email || '';
  const linkIndicacao = `https://www.ziller.club/register?indicador=${encodeURIComponent(codigoIndicacao)}`;

  // Estados principais
  const [saldo, setSaldo] = useState<number>(0);
  const [valorInvestido, setValorInvestido] = useState<number>(0);
  const [rendimentoDiario, setRendimentoDiario] = useState<number>(0);
  const [bonusResidual, setBonusResidual] = useState<number>(0);
  const [totalIndicados, setTotalIndicados] = useState<number>(0);
  const [pontos, setPontos] = useState<number>(0);
  const [pontosDiretos, setPontosDiretos] = useState<number>(0);
  const [pontosIndiretos, setPontosIndiretos] = useState<number>(0);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const progresso = Math.min((pontos / PONTOS_OBJETIVO) * 100, 100);
  const pontosRestantes = Math.max(PONTOS_OBJETIVO - pontos, 0);

  const fetchUsuarioDados = async () => {
    try {
      const [resUsuario, resRede, resRendimento] = await Promise.all([
        fetch('/api/usuario', { credentials: 'include' }),
        fetch('/api/rede', { credentials: 'include' }),
        fetch('/api/rendimentos/usuario', { credentials: 'include' })
      ]);

      if (!resUsuario.ok) throw new Error('Erro ao buscar dados do usuário');
      if (!resRede.ok) throw new Error('Erro ao buscar rede');
      if (!resRendimento.ok) throw new Error('Erro ao buscar rendimento');

      const dataUsuario = await resUsuario.json();
      const dataRede = await resRede.json();
      const dataRendimento = await resRendimento.json();

      const saldoCalculado = Number(dataRendimento.rendimento ?? 0) + Number(dataRendimento.bonusResidual ?? 0);

      setSaldo(saldoCalculado);
      setValorInvestido(Number(dataUsuario.valorInvestido ?? valorInvestido));
      setRendimentoDiario(Number(dataRendimento.rendimento ?? rendimentoDiario));
      setBonusResidual(Number(dataRendimento.bonusResidual ?? bonusResidual));
      setTotalIndicados(Number(dataUsuario.totalIndicados ?? totalIndicados));
      setPontos(Number(dataRede.pontosTotais ?? pontos));
      setPontosDiretos(Number(dataRede.diretos ?? pontosDiretos));
      setPontosIndiretos(Number(dataRede.indiretos ?? pontosIndiretos));
      setUserPhotoUrl(dataUsuario.photoUrl || userPhotoUrl);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsuarioDados();
      const interval = setInterval(fetchUsuarioDados, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleMenuClick = (item: MenuItem) => {
    if (item.action === 'logout') signOut({ callbackUrl: '/login' });
    else router.push(item.action);
  };

  if (status === 'loading' || loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const saldoTotal = saldo;

  return (
    <LayoutWrapper>
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        {/* HEADER FIXO */}
        <header className="flex items-center justify-between px-4 py-3 bg-gray-950 shadow-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img
              src={userPhotoUrl || '/img/avatar.png'}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-green-500"
            />
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Bell className="w-6 h-6 cursor-pointer hover:text-green-400 transition" />
        </header>

        {/* CONTEÚDO ROLÁVEL */}
        <main className="flex-1 overflow-y-auto pb-24">
          {/* CARD SALDO */}
          <div className="p-6 text-center bg-gradient-to-r from-green-600 to-green-500 rounded-b-3xl shadow-lg">
            <p className="text-sm">Saldo disponível</p>
            <h1 className="text-4xl font-bold mt-1">R$ {saldoTotal.toFixed(2)}</h1>
            <p className="text-xs mt-2">Investido: R$ {valorInvestido.toFixed(2)}</p>
          </div>

          {/* AÇÕES RÁPIDAS EM GRID */}
          <div className="grid grid-cols-2 gap-4 p-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item)}
                className="flex flex-col items-center justify-center bg-white/10 p-4 rounded-2xl shadow-md hover:bg-white/20 transition"
              >
                <img src={item.img} alt={item.label} className="w-10 h-10 mb-2" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          {/* SEÇÕES - ACCORDION */}
          <div className="px-4 pb-4">
            <Accordion type="single" collapsible className="mt-4 space-y-2">
              <AccordionItem value="pontuacao" className="border-0">
                <AccordionTrigger className="rounded-2xl bg-white/10 px-4 py-3 font-semibold">
                  📊 Pontuação & Indicação
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 text-sm space-y-2">
                  <p>Você já indicou <strong>{totalIndicados}</strong> pessoa(s)!</p>
                  <p>Pontos acumulados: {pontos}</p>
                  <p>Diretos: {pontosDiretos} | Indiretos: {pontosIndiretos}</p>
                  <div className="w-full bg-white/20 rounded-xl h-4">
                    <div
                      className="bg-green-500 h-4 rounded-xl transition-all duration-500"
                      style={{ width: `${progresso}%` }}
                    ></div>
                  </div>
                  <p>Faltam {pontosRestantes} pontos para desbloquear o próximo prêmio.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="indicacao" className="border-0">
                <AccordionTrigger className="rounded-2xl bg-white/10 px-4 py-3 font-semibold">
                  🎁 Seu Código de Indicação
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded-xl">
                    <a
                      href={linkIndicacao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate underline"
                    >
                      {linkIndicacao}
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(linkIndicacao)}
                      className="ml-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl text-sm"
                    >
                      Copiar
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="empresa" className="border-0">
                <AccordionTrigger className="rounded-2xl bg-white/10 px-4 py-3 font-semibold">
                  ℹ️ Info Empresa
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 text-sm space-y-1">
                  <p>📌 CNPJ: 60.483.352/0001-77</p>
                  <p>📧 E-mail: suporteziller@gmail.com</p>
                  <p>📱 WhatsApp: (21) 99652-8434</p>
                  <p>🌐 Site Oficial: www.ziller.club</p>
                  <p>📸 Instagram: @ziller.club</p>
                  <p>📊 Relatórios no Telegram</p>
                  <p>💰 Atualização via USDT: 01/10/2025</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </main>

        {/* FOOTER FIXO */}
        <footer className="sticky bottom-0 w-full bg-gray-950 text-white py-2 px-6 flex justify-between items-center shadow-lg">
          <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center">
            <Home className="w-6 h-6" /> <span className="text-xs">Início</span>
          </button>
          <button onClick={() => router.push('/carteira')} className="flex flex-col items-center">
            <Wallet className="w-6 h-6" /> <span className="text-xs">Carteira</span>
          </button>
          <button onClick={() => router.push('/perfil')} className="flex flex-col items-center">
            <User className="w-6 h-6" /> <span className="text-xs">Perfil</span>
          </button>
          <button onClick={() => router.push('/config')} className="flex flex-col items-center">
            <Settings className="w-6 h-6" /> <span className="text-xs">Config</span>
          </button>
        </footer>
      </div>
    </LayoutWrapper>
  );
}
