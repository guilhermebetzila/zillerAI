'use client';

import React, { useEffect, useState } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Bell, Home, User, Wallet, Settings, LogOut, Eye, EyeOff, MessageCircle } from "lucide-react";

interface MenuItem {
  label: string;
  action: string;
}

const menuItems: MenuItem[] = [
  { label: '🤖 Rede', action: '/games/ia' },
  { label: '📥 Depositar', action: '/games/depositar' },
  { label: '📤 Saque via Pix', action: '/games/saque' },
  { label: '📄 Cadastrar CPF', action: '/games/cadastrar-cpf' },
  { label: '💰 Ico', action: '/games/bolsao' },
  { label: '🎓 Mentoria', action: '/games/mentoria' },
];

const PONTOS_OBJETIVO = 1000;

interface Atividade {
  descricao: string;
  valor: number;
  tipo: string;
  data: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const codigoIndicacao = user?.id || user?.email || '';
  const linkIndicacao = `https://www.ziller.club/register?indicador=${encodeURIComponent(codigoIndicacao)}`;

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
  const [mostrarSaldo, setMostrarSaldo] = useState<boolean>(true);
  const [ultimasAtividades, setUltimasAtividades] = useState<Atividade[]>([]);
  const [qtdAvisos, setQtdAvisos] = useState<number>(0);

  const fetchUsuarioDados = async () => {
    try {
      const [resUsuario, resRede] = await Promise.all([
        fetch('/api/usuario', { credentials: 'include' }),
        fetch('/api/rede', { credentials: 'include' }),
      ]);

      if (!resUsuario.ok) throw new Error('Erro ao buscar usuário');
      if (!resRede.ok) throw new Error('Erro ao buscar rede');

      const dataUsuario = await resUsuario.json();
      const dataRede = await resRede.json();

      // ✅ Dados do usuário
      setSaldo(Number(dataUsuario.saldo ?? 0));
      setValorInvestido(Number(dataUsuario.valorInvestido ?? 0));
      setRendimentoDiario(Number(dataUsuario.rendimentoDiario ?? 0));
      setBonusResidual(Number(dataUsuario.bonusResidual ?? 0));
      setTotalIndicados(Number(dataUsuario.totalIndicados ?? 0));
      setPontos(Number(dataUsuario.pontos ?? 0));
      setUserPhotoUrl(dataUsuario.photoUrl || '');

      // ✅ Rede
      setPontosDiretos(Number(dataRede.pontosDiretos ?? 0));
      setPontosIndiretos(Number(dataRede.pontosIndiretos ?? 0));

      // Últimas atividades (mantido, mas ficará vazio sem fetch de atividades)
      setUltimasAtividades([]);
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

  useEffect(() => {
    try {
      const naoLidas = typeof window !== 'undefined'
        ? parseInt(localStorage.getItem('notificacoes_nao_lidas') || '0')
        : 0;
      setQtdAvisos(naoLidas);
    } catch {
      setQtdAvisos(0);
    }
  }, []);

  const abrirNotificacoes = () => {
    try {
      localStorage.setItem('notificacoes_nao_lidas', '0');
    } catch {}
    setQtdAvisos(0);
    router.push('/notificacoes');
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

  return (
    <LayoutWrapper>
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        {/* HEADER */}
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
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/5521971410840"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400 transition"
              title="Suporte no WhatsApp"
            >
              <MessageCircle className="w-6 h-6 cursor-pointer" />
            </a>
            <div className="relative cursor-pointer" onClick={abrirNotificacoes} title="Notificações">
              <Bell className="w-6 h-6 hover:text-green-400 transition" />
              {qtdAvisos > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {qtdAvisos}
                </span>
              )}
            </div>
            <LogOut
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-6 h-6 cursor-pointer hover:text-red-400 transition"
            />
          </div>
        </header>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-y-auto pb-24 flex flex-col items-center">
          {/* SALDO */}
          <div className="p-6 text-center bg-gradient-to-r from-green-600 to-green-500 rounded-b-3xl shadow-lg flex flex-col items-center w-full max-w-md">
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm">Saldo disponível:</p>
              <button onClick={() => setMostrarSaldo(!mostrarSaldo)}>
                {mostrarSaldo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            <h1 className="text-4xl font-bold mt-1">
              {mostrarSaldo ? `R$ ${saldo.toFixed(2)}` : '••••••'}
            </h1>
            <p className="text-xs mt-2">Investido: {mostrarSaldo ? `R$ ${valorInvestido.toFixed(2)}` : '••••'}</p>
            <p className="text-xs mt-1">Rendimento diário: {rendimentoDiario.toFixed(2)} USDT</p>
            <p className="text-xs">Bônus residual: {bonusResidual.toFixed(2)} USDT</p>
          </div>

          {/* CRIPTOMOEDAS */}
          <div className="p-4 w-full max-w-md">
            <h3 className="font-semibold mb-2">💎 Minhas Criptomoedas</h3>
            <div className="bg-white/10 rounded-xl p-4 shadow-md text-center cursor-pointer hover:bg-white/20 transition">
              <p className="font-medium">Criptomoeda Ziller</p>
            </div>
          </div>

          {/* BANNERS */}
          <div className="p-4 w-full max-w-md">
            <img src="/img/banneroficial.png" alt="Banner Oficial" className="rounded-2xl shadow-lg cursor-pointer hover:opacity-90 transition" />
          </div>
          <div className="p-4 w-full max-w-md">
            <img src="/img/banneroficial1.png" alt="Banner Oficial" className="rounded-2xl shadow-lg cursor-pointer hover:opacity-90 transition" />
          </div>

          {/* MENU RÁPIDO */}
          <div className="grid grid-cols-4 gap-4 p-4 w-full max-w-md">
            {menuItems.map((item, index) => (
              <button key={index} onClick={() => router.push(item.action)} className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-1 shadow-md hover:bg-white/20 transition">
                  <span className="text-lg">{item.label.split(" ")[0]}</span>
                </div>
                <span className="text-xs text-center">{item.label.replace(/^[^\s]+\s/, "")}</span>
              </button>
            ))}
          </div>

          {/* PONTUAÇÃO */}
          <div className="px-4 pb-4 w-full max-w-md space-y-4">
            <div className="bg-white/10 rounded-2xl p-4 shadow-md">
              <h3 className="font-semibold text-center mb-2">📊 Pontuação & Indicação</h3>
              <p>Você já indicou <strong>{totalIndicados}</strong> pessoa(s)!</p>
              <p>Pontos acumulados: {pontos}</p>
              <p>Diretos: {pontosDiretos} | Indiretos: {pontosIndiretos}</p>
              <div className="w-full bg-white/20 rounded-xl h-4 mt-2">
                <div className="bg-green-500 h-4 rounded-xl transition-all duration-500" style={{ width: `${(pontos / PONTOS_OBJETIVO) * 100}%` }}></div>
              </div>
              <p className="mt-1">Faltam {PONTOS_OBJETIVO - pontos} pontos para desbloquear o próximo prêmio.</p>
            </div>

            {/* INDICAÇÃO */}
            <div className="bg-white/10 rounded-2xl p-4 shadow-md">
              <h3 className="font-semibold text-center mb-2">🎁 Seu Código de Indicação</h3>
              <div className="flex items-center justify-between bg-black/20 px-3 py-2 rounded-xl">
                <a href={linkIndicacao} target="_blank" rel="noopener noreferrer" className="truncate underline">
                  {linkIndicacao}
                </a>
                <button onClick={() => navigator.clipboard.writeText(linkIndicacao)} className="ml-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl text-sm">
                  Copiar
                </button>
              </div>
            </div>

            {/* INFO */}
            <div className="bg-white/10 rounded-2xl p-4 shadow-md">
              <h3 className="font-semibold text-center mb-2">ℹ️ Info Empresa</h3>
              <p>📌 CNPJ: 60.483.352/0001-77</p>
              <p>📧 E-mail: suporteziller@gmail.com</p>
              <p>📱 WhatsApp: (21) 99652-8434</p>
              <p>🌐 Site Oficial: www.ziller.club</p>
              <p>📸 Instagram: @ziller.club</p>
              <p>📊 Relatórios no Telegram</p>
              <p>💰 Atualização via USDT: 01/10/2025</p>
            </div>
          </div>

          {/* ATIVIDADES */}
          <div className="px-4 pb-6 w-full max-w-md space-y-4">
            <div className="bg-white/10 rounded-2xl p-4 shadow-md">
              <h3 className="font-semibold mb-3">📝 Sua última atividade</h3>
              {ultimasAtividades.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma atividade recente.</p>
              ) : (
                <ul className="space-y-2">
                  {ultimasAtividades.map((atividade, index) => (
                    <li key={index} className="flex justify-between bg-gray-800 p-2 rounded-xl">
                      <span className="text-sm">{atividade.descricao}</span>
                      <span className={`text-sm ${atividade.valor >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {atividade.valor >= 0 ? `+ R$ ${atividade.valor.toFixed(2)}` : `- R$ ${Math.abs(atividade.valor).toFixed(2)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* FEEDBACK */}
            <div className="bg-white/10 rounded-2xl p-4 shadow-md">
              <h3 className="font-semibold mb-2">💡 Como foi sua experiência com a tela inicial?</h3>
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-xl text-sm">Boa</button>
                <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded-xl text-sm">Neutra</button>
                <button className="flex-1 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-xl text-sm">Ruim</button>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
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
