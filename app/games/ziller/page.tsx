'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import LayoutWrapper from '@components/LayoutWrapper';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  UserCheck,
  BarChart3,
  Zap,
  Star,
  Award,
  Database,
  MessageSquare,
  Cpu,
  Sparkles,
} from 'lucide-react';

/**
 * Ziller Hub - Page (completo)
 *
 * Recursos front-end inclusos:
 * - Listagem de parceiros (educadores, traders, empresas) com Ziller Score
 * - Match inteligente (recomendações personalizadas)
 * - Chat IA por parceiro (assessor virtual) -> POST /api/hub/partner/:id/chat
 * - Rewards / cashback visualização
 * - Ziller Labs (API / integração) card e documentação simplificada
 * - Insights dinâmicos (mock/endpoint) -> GET /api/hub/insights
 * - Ziller DNA (badge gerada via SVG local)
 *
 * BACKEND ENDPOINTS SUGERIDOS (implemente no servidor):
 * - GET  /api/hub/partners               --> lista de parceiros + métricas
 * - GET  /api/hub/match?userId=...      --> recomendações personalizadas
 * - POST /api/hub/partner/:id/chat      --> chat assistente IA (mensagens)
 * - GET  /api/hub/insights              --> cards de insights (IA)
 * - GET  /api/hub/rewards?userId=...    --> saldo de rewards/cashback
 * - POST /api/hub/partners (admin)      --> cadastrar novo parceiro
 *
 * NOTE:
 *  - Front usa fetch; se os endpoints não existirem, a UI cai para EXEMPLOS locais.
 *  - Implemente autenticação/autorizações no backend conforme necessário.
 */

/* ----------------------------- Tipos ----------------------------- */
type Partner = {
  id: string;
  tipo: 'Educador' | 'Trader' | 'Empresa';
  nome: string;
  descricao: string;
  imagem?: string;
  portfolio?: string[]; // urls ou descrições
  metrics?: {
    alunosAtivos?: number;
    avaliacaoMedia?: number; // 0-5
    taxaConversao?: number; // 0-1
    retornoMedioPct?: number; // ex: 0.12 = 12%
    transacoes?: number;
  };
  links?: { label: string; url: string }[];
};

type Insight = {
  id: string;
  title: string;
  summary: string;
  relevance: number; // 0-100
};

/* --------------------------- Helpers UI -------------------------- */

/** Gera Ziller Score (0-100) a partir das métricas do parceiro */
function calcZillerScore(metrics?: Partner['metrics']) {
  if (!metrics) return 50;
  // fórmula ponderada (exemplo): avaliacao * 40 + retorno * 30 + engajamento * 30
  const avaliacao = (metrics.avaliacaoMedia ?? 3) / 5; // 0-1
  const retorno = Math.min(1, Math.max(0, (metrics.retornoMedioPct ?? 0) / 0.5)); // 0-1 (normaliza assumindo 50% como topo)
  const engajamento = Math.tanh((metrics.alunosAtivos ?? 10) / 100) ; // 0-1 saturado
  const raw = (avaliacao * 0.4 + retorno * 0.3 + engajamento * 0.3) * 100;
  return Math.round(raw);
}

/** Gera uma cor simples baseada em seed (para avatar border) */
function seedToHue(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

/** Gerador de "Ziller DNA" como SVG string (baseado em hash simples) */
function generateZillerDnaSvg(seed: string, size = 96) {
  // cria alguns círculos cujo posicionamento depende do hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const r = 8 + (hash % 24);
    hash = Math.floor(hash / 7);
    const cx = Math.abs((hash * (i + 3)) % size);
    hash = Math.floor(hash / 3);
    const cy = Math.abs((hash * (i + 5)) % size);
    hash = Math.floor(hash / 5);
    const hue = (seedToHue(seed) + i * 40) % 360;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsl(${hue} 70% 60% / 0.15)"/>`);
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${parts.join('')}<circle cx='${size/2}' cy='${size/2}' r='${size/5}' fill='none' stroke='hsl(${seedToHue(seed)} 80% 60%)' stroke-width='2'/></svg>`;
}

/* ------------------------- Componentes UI ------------------------ */

function PartnerCard({
  partner,
  onOpen,
}: {
  partner: Partner;
  onOpen: (p: Partner) => void;
}) {
  const score = calcZillerScore(partner.metrics);
  const hue = seedToHue(partner.id + partner.nome);
  const scoreBadge = score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-500' : 'bg-gray-600';

  return (
    <div
      className="bg-white/6 rounded-2xl shadow-md overflow-hidden hover:ring-2 hover:ring-green-500 transition cursor-pointer"
      onClick={() => onOpen(partner)}
    >
      <div className="flex items-center gap-4 p-4">
        <div
          className="w-16 h-16 rounded-full border-2 overflow-hidden flex items-center justify-center"
          style={{ borderColor: `hsl(${hue} 70% 50%)` }}
        >
          {partner.imagem ? (
            <img src={partner.imagem} alt={partner.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs">
              {partner.nome.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-semibold text-sm">{partner.nome}</h3>
              <p className="text-[11px] text-green-300">{partner.tipo}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${scoreBadge}`}>
                <Star className="w-3 h-3" /> {score}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-300 mt-1 line-clamp-2">{partner.descricao}</p>
          <div className="flex gap-2 mt-2">
            {partner.links?.slice(0, 2).map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer" className="text-[11px] underline">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- MAIN PAGE --------------------------- */

export default function ZillerHubPage() {
  const router = useRouter();

  // state
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [recommendations, setRecommendations] = useState<Partner[] | null>(null);
  const [selected, setSelected] = useState<Partner | null>(null);
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [rewards, setRewards] = useState<{ balance: number; points: number } | null>(null);
  const [chatMessages, setChatMessages] = useState<{ from: 'user' | 'assistant'; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [userId] = useState<string>('user-123'); // substituir pelo ID real do session.user
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  /* -------------------- carregamento inicial -------------------- */
  useEffect(() => {
    // fetch parceiros
    (async () => {
      try {
        const res = await fetch('/api/hub/partners');
        if (!res.ok) throw new Error('no api');
        const json = await res.json();
        setPartners(json);
      } catch (err) {
        // fallback com exemplos locais
        setPartners(getSamplePartners());
      }
    })();

    // fetch recommendations
    (async () => {
      try {
        const res = await fetch(`/api/hub/match?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error('no match');
        const json = await res.json();
        setRecommendations(json);
      } catch {
        // fallback: top 3 partners by score
        const sample = getSamplePartners();
        setRecommendations(sample.sort((a, b) => calcZillerScore(b.metrics) - calcZillerScore(a.metrics)).slice(0, 3));
      }
    })();

    // fetch insights
    (async () => {
      try {
        const res = await fetch('/api/hub/insights');
        if (!res.ok) throw new Error('no insights');
        const json = await res.json();
        setInsights(json);
      } catch {
        setInsights(getSampleInsights());
      }
    })();

    // fetch rewards
    (async () => {
      try {
        const res = await fetch(`/api/hub/rewards?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const json = await res.json();
          setRewards(json);
        } else {
          setRewards({ balance: 12.5, points: 320 });
        }
      } catch {
        setRewards({ balance: 12.5, points: 320 });
      }
    })();
  }, [userId]);

  /* -------------------- abrir perfil parceiro -------------------- */
  function openPartner(partner: Partner) {
    setSelected(partner);
    setChatMessages([]); // limpa chat ao abrir outro parceiro
  }

  /* -------------------- enviar mensagem para o assistente IA -------------------- */
  async function sendChatMessage(text: string) {
    if (!selected) return;
    const partnerId = selected.id;
    setChatMessages((s) => [...s, { from: 'user', text }]);
    setChatLoading(true);

    try {
      const res = await fetch(`/api/hub/partner/${partnerId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: text }),
      });

      if (res.ok) {
        const json = await res.json();
        // espera: { reply: string }
        setChatMessages((s) => [...s, { from: 'assistant', text: json.reply }]);
      } else {
        // fallback simulado
        setChatMessages((s) => [...s, { from: 'assistant', text: 'Desculpe, assistente indisponível no momento. Tente mais tarde.' }]);
      }
    } catch (err) {
      setChatMessages((s) => [...s, { from: 'assistant', text: 'Erro ao conectar com o assistente.' }]);
    } finally {
      setChatLoading(false);
    }
  }

  /* -------------------- UI render -------------------- */
  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        {/* header */}
        <header className="flex items-center justify-between px-4 py-3 bg-gray-950 shadow-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1 text-gray-300 hover:text-green-400 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
          </div>
          <h1 className="text-lg font-semibold text-center flex-1">🕹️ Ziller Hub — Conectar & Monetizar</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-400">Rewards</div>
              <div className="font-semibold">{rewards ? `${rewards.points} pts • $${rewards.balance.toFixed(2)}` : '—'}</div>
            </div>
            <button
              onClick={() => router.push('/games/ziller/cadastrar')}
              title="Cadastrar parceiro (admin)"
              className="px-3 py-1 rounded-xl bg-white/6 hover:bg-white/10 transition text-sm flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Cadastrar
            </button>
          </div>
        </header>

        {/* main */}
        <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center">
          {/* introdução + CTA */}
          <section className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white/6 rounded-2xl p-4 shadow-md">
              <h2 className="text-2xl font-bold text-green-400 mb-2">Ziller Hub — Ecosistema Inteligente</h2>
              <p className="text-sm text-gray-300">
                Conecte-se com educadores, traders e empresas. Ganhe comissão automática, converse com assistentes IA treinados no conteúdo dos parceiros e receba recomendações personalizadas.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="flex items-center gap-2"><Zap className="w-4 h-4" /><div className="text-xs">Match automático</div></div>
                  <div className="text-xs text-gray-300 mt-2">Sugestões baseadas no seu perfil financeiro e histórico.</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /><div className="text-xs">Ziller Score</div></div>
                  <div className="text-xs text-gray-300 mt-2">Reputação pública e transparente dos parceiros.</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /><div className="text-xs">IA Assistente</div></div>
                  <div className="text-xs text-gray-300 mt-2">Assistentes treinados com conteúdo do parceiro para suporte 24/7.</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="flex items-center gap-2"><Award className="w-4 h-4" /><div className="text-xs">Rewards</div></div>
                  <div className="text-xs text-gray-300 mt-2">Cashback, pontos e comissões para você.</div>
                </div>
              </div>
            </div>

            {/* Ziller Labs / API */}
            <aside className="bg-white/6 rounded-2xl p-4 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ziller Labs</h3>
                <Database className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-xs text-gray-300">Documentação rápida de integração e marketplace de APIs financeiras (IA, risk, trade execution).</p>
              <ul className="text-xs text-gray-400 mt-2 list-disc list-inside space-y-1">
                <li>Webhook de trade e execução</li>
                <li>Documentação OpenAPI</li>
                <li>SDKs (Node / Python)</li>
              </ul>
              <div className="mt-auto flex gap-2">
                <a href="/hub/api-docs" className="text-[13px] underline flex items-center gap-1"><ExternalLink className="w-4 h-4" /> Docs</a>
                <a href="/hub/apply" className="ml-auto text-[13px] underline">Aplicar</a>
              </div>
            </aside>
          </section>

          {/* RECOMMENDATIONS */}
          <section className="max-w-4xl w-full mb-6">
            <h3 className="text-sm text-gray-300 mb-2">Recomendados para você</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(recommendations ?? []).map((p) => (
                <div key={p.id}><PartnerCard partner={p} onOpen={openPartner} /></div>
              ))}
              {(!recommendations || recommendations.length === 0) && <div className="col-span-3 text-xs text-gray-500">Sem recomendações por enquanto</div>}
            </div>
          </section>

          {/* LISTA COMPLETA */}
          <section className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-300 mb-2">Parceiros</h3>
              <div className="space-y-3">
                {(partners ?? []).map((p) => (
                  <PartnerCard key={p.id} partner={p} onOpen={openPartner} />
                ))}
              </div>
            </div>

            {/* Insights + DNA */}
            <div className="space-y-4">
              <div className="bg-white/6 rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Insights do mercado</h3>
                  <Sparkles className="w-5 h-5 text-green-400" />
                </div>
                <div className="mt-3 space-y-2">
                  {(insights ?? []).map((ins) => (
                    <div key={ins.id} className="p-2 bg-white/5 rounded-md">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium">{ins.title}</div>
                          <div className="text-xs text-gray-300">{ins.summary}</div>
                        </div>
                        <div className="text-xs text-gray-400">{ins.relevance}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/6 rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold">Seu Ziller DNA</h4>
                  <p className="text-xs text-gray-300">Um selo visual único gerado a partir do seu comportamento na plataforma.</p>
                  <div className="mt-2 text-xs text-gray-200">Identidade: <strong>Investidor estratégico • Seguidor de IA</strong></div>
                  <div className="mt-3">
                    <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl">
                      <div dangerouslySetInnerHTML={{ __html: generateZillerDnaSvg(userId, 64) }} />
                      <div className="text-xs">ID: {userId}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <button className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700">Compartilhar selo</button>
                </div>
              </div>
            </div>
          </section>

          {/* Partner detail / chat drawer */}
          {selected && (
            <div className="fixed right-4 bottom-4 w-full max-w-md z-50">
              <div className="bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-white/6">
                  <div className="flex items-center gap-3">
                    <img src={selected.imagem || '/img/avatar.png'} className="w-10 h-10 rounded-full object-cover border-2" alt={selected.nome} />
                    <div>
                      <div className="font-semibold">{selected.nome}</div>
                      <div className="text-xs text-gray-300">{selected.tipo} • Ziller Score {calcZillerScore(selected.metrics)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={selected.links?.[0]?.url || '#'} target="_blank" rel="noreferrer" className="text-xs underline flex items-center gap-1"><ExternalLink className="w-4 h-4" /> Perfil</a>
                    <button onClick={() => setSelected(null)} className="text-xs px-2 py-1">Fechar</button>
                  </div>
                </div>

                <div className="p-3 max-h-72 overflow-y-auto space-y-2">
                  <div className="text-xs text-gray-200">{selected.descricao}</div>

                  <div className="mt-3">
                    <h4 className="text-sm font-semibold">Portfólio</h4>
                    <ul className="text-xs text-gray-300 mt-2 space-y-1">
                      {(selected.portfolio ?? []).map((item, i) => <li key={i}>• {item}</li>)}
                    </ul>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-semibold">Chat Assistente</h4>
                    <div className="bg-black/20 rounded-xl p-2 max-h-40 overflow-y-auto space-y-2">
                      {chatMessages.length === 0 ? (
                        <div className="text-xs text-gray-400">Converse com o assistente treinado no conteúdo deste parceiro.</div>
                      ) : (
                        chatMessages.map((m, i) => (
                          <div key={i} className={`text-xs ${m.from === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block px-3 py-2 rounded-xl ${m.from === 'user' ? 'bg-green-600/40' : 'bg-white/6'}`}>{m.text}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <input
                        ref={chatInputRef}
                        placeholder="Pergunte algo ao assistente..."
                        className="flex-1 px-3 py-2 rounded-xl bg-white/5 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && chatInputRef.current?.value.trim()) {
                            const txt = chatInputRef.current.value;
                            chatInputRef.current.value = '';
                            sendChatMessage(txt);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const txt = chatInputRef.current?.value || '';
                          if (txt.trim()) {
                            chatInputRef.current!.value = '';
                            sendChatMessage(txt);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700"
                      >
                        {chatLoading ? '...' : 'Enviar'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1"><Star className="w-4 h-4" /> Score: <strong>{calcZillerScore(selected.metrics)}</strong></div>
                    <div className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Retorno médio: <strong>{((selected.metrics?.retornoMedioPct ?? 0) * 100).toFixed(1)}%</strong></div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        // exemplo: redireciona para página de checkout/serviço
                        const url = selected.links?.[0]?.url || '/';
                        window.open(url, '_blank');
                      }}
                      className="px-3 py-2 rounded-xl bg-green-600 hover:bg-green-700"
                    >
                      Contratar / Ver serviço
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* footer */}
        <footer className="bg-gray-950 text-gray-400 text-center py-3 text-xs border-t border-white/10">
          © {new Date().getFullYear()} Ziller Club — Hub integrado: IA • API • Reputação • Rewards
        </footer>
      </div>
    </LayoutWrapper>
  );
}

/* ------------------------- Dados de exemplo ----------------------- */

function getSamplePartners(): Partner[] {
  return [
    {
      id: 'p-ana',
      tipo: 'Educador',
      nome: 'Ana Ribeiro',
      descricao: 'Educadora financeira focada em orçamento, hábitos financeiros e mentalidade. Cursos ao vivo e mentorias individuais.',
      imagem: '/img/educadora1.png',
      portfolio: ['Curso: Controle Emocional no Trade', 'Mentoria 1-1 (30 dias)'],
      metrics: { alunosAtivos: 520, avaliacaoMedia: 4.7, taxaConversao: 0.12, retornoMedioPct: 0.08, transacoes: 1200 },
      links: [{ label: 'Perfil', url: 'https://ziller.club/educadores/ana-ribeiro' }],
    },
    {
      id: 'p-carlos',
      tipo: 'Trader',
      nome: 'Carlos Mota',
      descricao: 'Trader certificado — estratégias de swing e copy trading. Histórico focado em gestão de risco.',
      imagem: '/img/trader1.png',
      portfolio: ['Estratégia Swing 3x', 'CopyTrading Pro'],
      metrics: { alunosAtivos: 240, avaliacaoMedia: 4.5, taxaConversao: 0.18, retornoMedioPct: 0.22, transacoes: 800 },
      links: [{ label: 'Perfil', url: 'https://ziller.club/traders/carlos-mota' }],
    },
    {
      id: 'p-cryptolabs',
      tipo: 'Empresa',
      nome: 'CryptoLabs',
      descricao: 'Empresa de soluções blockchain e IA, integra APIs de análise de risco e execução para corretoras.',
      imagem: '/img/empresa1.png',
      portfolio: ['API RiskScore', 'SDK Integrador'],
      metrics: { alunosAtivos: 90, avaliacaoMedia: 4.2, taxaConversao: 0.09, retornoMedioPct: 0.05, transacoes: 400 },
      links: [{ label: 'Site', url: 'https://cryptolabs.example' }],
    },
  ];
}

function getSampleInsights(): Insight[] {
  return [
    { id: 'i1', title: 'Fluxo institucional em BTC subiu 12%', summary: 'Movimento detectado em exchanges - fique atento a volatilidade', relevance: 82 },
    { id: 'i2', title: 'Aulas sobre gestão emocional cresceram 40%', summary: 'Usuários que fizeram o curso reduziram drawdown médio', relevance: 68 },
    { id: 'i3', title: 'Estratégias de swing apresentaram retorno médio 18% no mês', summary: 'Top traders oferecem pacotes com simuladores', relevance: 55 },
  ];
}
