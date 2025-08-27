import Link from "next/link";

export const metadata = {
  title: "Ecossistema • Ziller",
  description: "Conheça o ecossistema Ziller — força, segurança e transparência movidas por IA.",
};

export default function EcossistemaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative px-4 pt-16 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <span className="text-black text-2xl font-black">🦍</span>
            </div>
            <span className="uppercase tracking-widest text-xs text-white/60">
              Ziller • Ecossistema
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-teal-300">
              A Força da Inteligência Artificial a seu lado
            </span>
          </h1>
          <p className="mt-4 text-white/80 text-lg">
            Na selva dos mercados financeiros, apenas os mais fortes prosperam.
            A Ziller nasceu para ser esse gigante: tecnologia de ponta, disciplina
            e lealdade à nossa comunidade.
          </p>

          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* BLOCO 1 */}
      <section className="px-4 py-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">O Especialista que nunca dorme</h2>
            <p className="text-white/80">
              A nossa IA observa em silêncio, analisa profundamente e age apenas
              quando é o momento certo — assim como o gorila que representa nossa
              marca: <strong>força, família e lealdade</strong>.
            </p>
            <ul className="mt-4 space-y-2 text-white/80 list-disc pl-5">
              <li>Análise de mercados nacionais e internacionais em tempo real</li>
              <li>Integração com o calendário econômico para antecipar movimentos</li>
              <li>Leitura avançada de candles + análise técnica e fundamentalista</li>
              <li>Poucas entradas, porém altamente assertivas</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Resultados com sustentabilidade</h2>
            <p className="text-white/80">
              Tecnologia é cara e desenvolvimento exige disciplina. Por isso, o nosso
              modelo é pensado para ser <strong>sólido e contínuo</strong>.
            </p>
            <ul className="mt-4 space-y-2 text-white/80 list-disc pl-5">
              <li>Divisão de lucros diária com foco na preservação do capital</li>
              <li>Rendimento-alvo entre <strong>1,5% e 2,5% ao dia</strong></li>
              <li>Ecossistema limitado a <strong>100 mil usuários</strong> para estabilidade</li>
              <li>Prioridade sempre na qualidade das operações</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BLOCO 2 */}
      <section className="px-4 py-10 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Transparência e segurança</h2>
            <ul className="space-y-2 text-white/80 list-disc pl-5">
              <li>Relatórios diários com movimentações do ecossistema</li>
              <li>Acesso ao <strong>Bolsão da Empresa</strong> para acompanhar o caixa</li>
              <li>Entregas trimestrais: operações, lucros, perdas e projeções</li>
              <li>Criptografia de ponta e auditorias periódicas</li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">Crescimento coletivo</h2>
            <ul className="space-y-2 text-white/80 list-disc pl-5">
              <li>Mentorias exclusivas e trilhas de aprendizado</li>
              <li>Comunidade privada de investidores</li>
              <li>Formação de consciência financeira e gestão de risco</li>
              <li>Suporte humano + IA para decisões melhores</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FECHO */}
      <section className="px-4 py-16 border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl font-extrabold">
            Ziller — <span className="text-white/80">Força. Família. Lealdade.</span>
          </h3>
          <p className="mt-3 text-white/70">
            Um ecossistema exclusivo que une tecnologia, segurança e propósito —
            para prosperarmos juntos, com os pés no chão e a visão no futuro.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition"
            >
              Acessar Dashboard
            </Link>
            <Link
              href="/games/como-funciona"
              className="px-5 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition"
            >
              Como Funciona
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
