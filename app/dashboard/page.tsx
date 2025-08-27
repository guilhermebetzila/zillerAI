'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [saldo, setSaldo] = useState<number>(0);
  const [valorInvestido, setValorInvestido] = useState<number>(0);
  const [rendimentoDiario, setRendimentoDiario] = useState<number>(0);
  const [bonusResidual, setBonusResidual] = useState<number>(0);
  const [totalIndicados, setTotalIndicados] = useState<number>(0);
  const [pontos, setPontos] = useState<number>(0);
  const [pontosDiretos, setPontosDiretos] = useState<number>(0);
  const [pontosIndiretos, setPontosIndiretos] = useState<number>(0);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>('');

  const user = session?.user as any;
  const userId = user?.id ? Number(user.id) : undefined;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';

  const PONTOS_OBJETIVO = 1000;

  // Fetch dados do usuário
  useEffect(() => {
    const fetchUsuario = async () => {
      if (!API_BASE_URL || !userId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/saldo?userId=${userId}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setSaldo(Number(data.saldo) || 0);
          setValorInvestido(Number(data.valorInvestido) || 0);
          setTotalIndicados(Number(data.totalIndicados) || 0);
          setPontos(Number(data.pontos) || 0);
          setBonusResidual(Number(data.bonusResidual) || 0);
          setUserPhotoUrl(data.photoUrl || '');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    };
    fetchUsuario();
  }, [userId]);

  // Fetch rede
  useEffect(() => {
    const fetchRede = async () => {
      if (!API_BASE_URL || !userId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/rede?userId=${userId}`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setPontosDiretos(Number(data.diretos) || 0);
          setPontosIndiretos(Number(data.indiretos) || 0);
          setPontos(Number(data.pontosTotais) || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar rede:', error);
      }
    };
    fetchRede();
  }, [userId]);

  // Fetch rendimento diário
  useEffect(() => {
    const fetchRendimento = async () => {
      if (!API_BASE_URL || !userId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/rendimentos/usuario?userId=${userId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setRendimentoDiario(Number(data.rendimento) || 0);
          setBonusResidual(Number(data.bonusResidual) || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar rendimento diário:', error);
      }
    };
    fetchRendimento();
  }, [userId]);

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
          body: JSON.stringify({ userId, photoUrl: uploadData.url }),
        });
      }
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
    }
  };

  const progresso = Math.min((pontos / PONTOS_OBJETIVO) * 100, 100);
  const pontosRestantes = Math.max(PONTOS_OBJETIVO - pontos, 0);
  const codigoIndicacao = user?.id || user?.email || '';
  const linkIndicacao = `https://www.ziller.club/register?indicador=${encodeURIComponent(codigoIndicacao)}`;

  if (status === 'loading') return <p className="text-center mt-10 text-white">Carregando...</p>;
  if (status === 'unauthenticated') return <p className="text-center mt-10 text-red-500">Acesso negado. Faça login.</p>;

  return (
    <LayoutWrapper>
      <div className="min-h-screen px-4 py-4 text-white relative overflow-y-auto">
        <div className="mb-6 max-w-3xl mx-auto">
          {/* Card perfil */}
          <div className="flex flex-col items-center p-6 rounded-2xl mb-4 text-black bg-white/5">
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
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-sm text-gray-300">{user?.email}</p>
            <button
              className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-2xl shadow-lg font-medium transition text-base"
              onClick={() => router.push('/editar-perfil')}
            >
              Editar Perfil
            </button>
          </div>

          {/* Barra de menu horizontal */}
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

          {/* Barra de saldo e infos */}
          <div className="mb-6 p-4 bg-white/10 rounded-2xl shadow-md text-black">
            <p>💵 Saldo atual: <strong>${saldo.toFixed(2)}</strong></p>
            <p>📈 Valor Investido: <strong>${valorInvestido.toFixed(2)}</strong></p>
            <p>🌟 Rendimento Diário: <strong>${rendimentoDiario.toFixed(2)}</strong></p>
            <p>🎁 Bônus Reesidual: <strong>${bonusResidual.toFixed(2)}</strong></p>
          </div>

          {/* Blocos horizontais */}
          <div className="mt-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-1">
              {/* Bloco 1 */}
              <div className="flex-shrink-0 w-64 h-40 bg-white/10 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Roadmap Ziller</h3>
                <p className="text-sm text-gray-300">Acompanhe as etapas e novidades da nossa plataforma.</p>
              </div>
              {/* Bloco 2 */}
              <div className="flex-shrink-0 w-64 h-40 bg-white/10 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Lançamento em Breve</h3>
                <p className="text-sm text-gray-300 mb-2">Ziller Coin</p>
                <img src="/img/coin.png" alt="Ziller Coin" className="w-12 h-12 object-contain" />
              </div>
              {/* Bloco 3 */}
              <div className="flex-shrink-0 w-64 h-40 bg-white/10 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Banco Digital Internacional & Corretora</h3>
                <p className="text-sm text-gray-300">Tenha sua conta global com facilidade e segurança.</p>
              </div>
              {/* Bloco 4 */}
              <div className="flex-shrink-0 w-64 h-40 bg-white/10 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Em Breve</h3>
                <div className="flex gap-2">
                  <img src="/img/play.png" alt="Play" className="w-12 h-12 object-contain" />
                  <img src="/img/app.png" alt="App" className="w-12 h-12 object-contain" />
                </div>
              </div>
              {/* Bloco 5 */}
              <div className="flex-shrink-0 w-64 h-40 bg-white/10 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">MarketPlace</h3>
                <p className="text-sm text-gray-300">Produtos da Ziller</p>
              </div>
              {/* Bloco 6 */}
              <div className="flex-shrink-0 w-64 h-40 bg-white/10 rounded-2xl p-4 flex flex-col justify-center items-center text-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-lg font-semibold mb-2">Lançamento Livro</h3>
                <p className="text-sm text-gray-300 text-center">
                  A Desastrada Façanha de uma mente <br /> (História real da vida dos fundadores da Ziller)
                </p>
              </div>
            </div>
          </div>
          {/* Accordion: Pontuação & Indicação */}
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

            {/* Accordion: Código de Indicação */}
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

            {/* Accordion: Apps */}
            <AccordionItem value="apps" className="border-0">
              <AccordionTrigger className="rounded-2xl bg-white/10 px-4 py-3 font-semibold flex justify-between items-center border-0">
                <span>📱 Apps</span>
                <ChevronDown className="w-5 h-5 transition-transform duration-300 data-[state=open]:rotate-180" />
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 border-0">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  <img src="/img/whats.png" alt="WhatsApp" className="w-16 h-16 rounded-2xl" />
                  <img src="/img/telegram.png" alt="Telegram" className="w-16 h-16 rounded-2xl" />
                  <img src="/img/tiktok.png" alt="TikTok" className="w-16 h-16 rounded-2xl" />
                  <img src="/img/insta.png" alt="Instagram" className="w-16 h-16 rounded-2xl" />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Accordion: Info Empresa */}
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
