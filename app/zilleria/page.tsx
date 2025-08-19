// app/o-que-e-a-ziller/page.tsx
"use client";

import { motion } from "framer-motion";

export default function OQueEZiller() {
  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-yellow-400"
        >
          O que é a Ziller.ia
        </motion.h1>

        {/* Subtítulo */}
        <p className="text-lg text-gray-300 text-center">
          Inteligência Artificial a serviço do seu futuro
        </p>

        {/* Sessões */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            🦍 O Especialista que nunca dorme
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Monitoramento 24h de mercados nacionais e internacionais</li>
            <li>Integração com calendários econômicos globais</li>
            <li>Análise técnica e fundamentalista com leitura avançada</li>
            <li>Poucas entradas, porém altamente assertivas</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            📊 Resultados com sustentabilidade
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Rendimento-alvo: 1,5% a 2,5% ao dia</li>
            <li>Divisão de lucros diária preservando o capital</li>
            <li>Ecossistema limitado a 100 mil usuários</li>
            <li>Qualidade acima da quantidade de operações</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            🔒 Transparência e segurança
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Relatórios diários com movimentações</li>
            <li>Acesso ao Bolsão da Empresa</li>
            <li>Auditorias periódicas e criptografia de ponta</li>
            <li>Entregas trimestrais com projeções, lucros e perdas</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            🌍 Crescimento coletivo
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Mentorias exclusivas e trilhas de aprendizado</li>
            <li>Comunidade privada de investidores</li>
            <li>Formação em consciência financeira e gestão de risco</li>
            <li>Suporte humano + IA para decisões melhores</li>
          </ul>
        </section>

        {/* Encerramento */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl font-bold text-yellow-400">
            Ziller — Força. Família. Lealdade.
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Mais que uma plataforma, somos um ecossistema exclusivo que une
            tecnologia, segurança e propósito. Crescemos juntos, com os pés no
            presente e os olhos no futuro.
          </p>
          <a
            href="/"
            className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-2xl font-semibold hover:bg-yellow-500 transition"
          >
            Acessar Dashboard
          </a>
        </motion.div>
      </div>
    </main>
  );
}
