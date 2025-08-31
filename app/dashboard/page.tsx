'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/accordion";
import { ChevronDown, Bell } from "lucide-react";

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

  const codigoIndicacao = user?.id || user?.email || '';
  const linkIndicacao = `https://www.ziller.club/register?indicador=${encodeURIComponent(codigoIndicacao)}`;
  const progresso = Math.min((pontos / PONTOS_OBJETIVO) * 100, 100);
  const pontosRestantes = Math.max(PONTOS_OBJETIVO - pontos, 0);

  useEffect(() => {
    const fetchUsuario = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/usuario`, { credentials: 'include' }); // ✅ Corrigido
        if (!res.ok) throw new Error('Erro ao buscar dados do usuário');
        const data = await res.json();

        setSaldo(Number(data.saldo) || 0);
        setValorInvestido(Number(data.valorInvestido) || 0); // ✅ Corrigido (maiúsculo)
        setRendimentoDiario(Number(data.rendimentoDiario) || 0);
        setBonusResidual(Number(data.bonusResidual) || 0);
        setTotalIndicados(Number(data.totalIndicados) || 0);
        setPontos(Number(data.pontos) || 0);
        setUserPhotoUrl(data.photoUrl || '');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (status === 'authenticated') fetchUsuario();
  }, [status]);

  useEffect(() => {
    const fetchRede = async () => {
      try {
        const res = await fetch(`/api/rede`, { credentials: 'include' });
        if (!res.ok) throw new Error('Erro ao buscar rede');
        const data = await res.json();
        setPontosDiretos(Number(data.diretos) || 0);
        setPontosIndiretos(Number(data.indiretos) || 0);
        setPontos(Number(data.pontosTotais) || pontos);
      } catch (error) {
        console.error(error);
      }
    };
    if (status === 'authenticated') fetchRede();
  }, [status]);

  useEffect(() => {
    const fetchRendimento = async () => {
      try {
        const res = await fetch(`/api/rendimentos/usuario`, { credentials: 'include' });
        if (!res.ok) throw new Error('Erro ao buscar rendimento diário');
        const data = await res.json();
        setRendimentoDiario(Number(data.rendimento) || 0);
        setBonusResidual(Number(data.bonusResidual) || bonusResidual);
      } catch (error) {
        console.error(error);
      }
    };
    if (status === 'authenticated') fetchRendimento();
  }, [status]);

  const handleMenuClick = (item: MenuItem) => {
    if (item.action === 'logout') signOut({ callbackUrl: '/login' });
    else router.push(item.action);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        setUserPhotoUrl(uploadData.url);
        await fetch('/api/user/update-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: uploadData.url }),
        });
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
    }
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

  // Calcula saldo total considerando rendimento diário + residual
  const saldoTotal = saldo + rendimentoDiario + bonusResidual;

  return (
    <LayoutWrapper>
      <div className="min-h-screen px-4 py-4 text-white relative overflow-y-auto">
        <header className="flex justify-between items-center mb-6 px-2">
          <div className="flex-1"></div>
          <h1 className="text-2xl font-bold text-center flex-1">ZILLER.ai</h1>
          <div className="flex-1 flex justify-end">
            <Bell className="w-6 h-6 cursor-pointer hover:text-green-400 transition" />
          </div>
        </header>

        <div className="mb-6 max-w-3xl mx-auto">
          {/* Card do usuário */}
          <div className="flex flex-col items-center p-6 rounded-2xl mb-4 bg-white/5">
            <div className="relative w-28 h-28 mb-3">
              <img
                src={userPhotoUrl || '/img/avatar.png'}
                alt="Foto do usuário"
                className="w-full h-full object-cover rounded-full border-2 border-green-500"
              />
              <label
                htmlFor="upload-photo"
                className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 text-white p-1 rounded-full cursor-pointer shadow-md text-sm"
              >
                ✏️
              </label>
              <input
                type="file"
                id="upload-photo"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
            <h2 className="text-xl font-semibold text-white">{displayName}</h2>
            <p className="text-sm text-gray-300">{user?.email}</p>
            <button
              className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-2xl shadow-lg font-medium transition text-base"
              onClick={() => router.push('/editar-perfil')}
            >
              Editar Perfil
            </button>
          </div>

          {/* Card de valores ajustado */}
          <div className="mb-6 p-4 bg-white/10 rounded-2xl shadow-md text-white">
            <p>💰 Saldo Total: <strong>${saldoTotal.toFixed(2)}</strong></p>
            <p>💵 Saldo Anterior: <strong>${saldo.toFixed(2)}</strong></p>
            <p>📈 Valor Investido: <strong>${valorInvestido.toFixed(2)}</strong></p>
            <p>🌟 Rendimento Diário: <strong>${rendimentoDiario.toFixed(2)}</strong></p>
            <p>🎁 Bônus Residual Hoje: <strong>${bonusResidual.toFixed(2)}</strong></p>
          </div>

          {/* Menu horizontal */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-1 py-2 justify-start">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleMenuClick(item)}
                  className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
                >
                  <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="mt-6 space-y-2">
            <AccordionItem value="pontuacao" className="border-0">
              <AccordionTrigger className="rounded-2xl bg-white/10 px-4 py-3 font-semibold flex justify-between items-center border-0">
                <span>📊 Pontuação & Indicação</span>
                <ChevronDown className="w-5 h-5 transition-transform duration-300 data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 space-y-2 text-sm border-0">
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
              <AccordionTrigger className="rounded-2xl bg-white/10 px-4 py-3 font-semibold flex justify-between items-center border-0">
                <span>🎁 Seu Código de Indicação</span>
                <ChevronDown className="w-5 h-5 transition-transform duration-300 data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 text-sm border-0">
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
              <AccordionTrigger className="rounded-2xl bg-white/10 px-4 py-3 font-semibold flex justify-between items-center border-0">
                <span>ℹ️ Info Empresa</span>
                <ChevronDown className="w-5 h-5 transition-transform duration-300 data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 text-sm space-y-1 border-0">
                <p>📌 CNPJ: 60.483.352/0001-77</p>
                <p>📧 E-mail: suporteziller@gmail.com</p>
                <p>📱 WhatsApp: (21) 99652-8434</p>
                <p>🌐 Site Oficial: www.ziller.club</p>
                <p>📸 Instagram: @ziller.club</p>
                <p>📊 Relatórios entregues no grupo do Telegram</p>
                <p>💰 Atualização de recebimento via USDT: 01/10/2025</p>
                <p>📅 Segunda: Mentoria Ao Vivo</p>
                <p>📅 Terça: Apresentação Ziller</p>
                <p>📅 Sexta: Alinhamento com a Liderança</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* === NOVA SEÇÃO: Carrossel de imagens e cards (acima do rodapé) === */}
          <div className="mt-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-1 py-3 items-stretch">
              {/* 3 fotos quadradas com bordas arredondadas */}
              <a
                href="https://t.me/+atEKwprJriVlY2Ex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-md"
              >
                <img src="/img/telegram.png" alt="Telegram" className="w-full h-full object-cover" />
              </a>

              <a
                href="https://wa.me/5521996528434"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-md"
              >
                <img src="/img/whats.png" alt="WhatsApp" className="w-full h-full object-cover" />
              </a>

              <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-md bg-white/10">
                <img src="/img/coin.png" alt="Coin" className="w-full h-full object-cover" />
              </div>

              {/* Quarta “imagem”: Em Breve + play.png abaixo */}
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-md bg-white/10 flex flex-col items-center justify-center p-1">
                <span className="text-[10px] leading-tight text-center">Em Breve</span>
                <img src="/img/play.png" alt="Play" className="w-6 h-6 mt-1" />
              </div>

              {/* Quadrados maiores com textos */}
              <div className="flex-shrink-0 min-w-[260px] h-28 rounded-2xl bg-white/10 shadow-md flex items-center justify-center text-center px-3">
                <span className="text-sm font-medium">EM BREVE acesso ao roadmap da empresa</span>
              </div>

              <div className="flex-shrink-0 min-w-[260px] h-28 rounded-2xl bg-white/10 shadow-md flex items-center justify-center text-center px-3">
                <span className="text-sm font-medium">Em Breve Banco internacional</span>
              </div>

              <div className="flex-shrink-0 min-w-[260px] h-28 rounded-2xl bg-white/10 shadow-md flex items-center justify-center text-center px-3">
                <span className="text-sm font-medium">
                  Especialista em Desenvolvimento de ferramentas de tecnologia para produtos financeiros
                </span>
              </div>

              <div className="flex-shrink-0 min-w-[260px] h-28 rounded-2xl bg-white/10 shadow-md flex items-center justify-center text-center px-3">
                <span className="text-sm font-medium">
                  Participantes para incentivo contra a fome e educação
                </span>
              </div>

              <div className="flex-shrink-0 min-w-[260px] h-28 rounded-2xl bg-white/10 shadow-md flex items-center justify-center text-center px-3">
                <span className="text-sm font-medium">
                  Em breve lançamento Criptomoeda e Capital aberto bolsa de valores
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="w-full mt-8 text-white py-4 px-4 text-sm">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold mb-2">Segurança & Confiança</h3>
                <p>Auditoria independente concluída com sucesso.</p>
                <p>IA operando com precisão validada de 87,9%.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Transparência Total</h3>
                <p>Painel com histórico completo e transparente.</p>
                <p>Saque e depósito via Pix 100% confiáveis.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Comunidade Ziller</h3>
                <p>Top 10 Zillers com maiores ganhos do mês.</p>
                <p>Missão: transformar vidas com renda passiva.</p>
              </div>
            </div>
            <div className="text-center mt-4">
              © {new Date().getFullYear()} Ziller.Ia • Todos os direitos reservados
            </div>
          </footer>
        </div>
      </div>
    </LayoutWrapper>
  );
}
