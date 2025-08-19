// app/inteligencia-artificial/page.tsx
"use client";

import { motion } from "framer-motion";

export default function InteligenciaArtificial() {
  return (
    <main className="min-h-screen bg-gray-900 text-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Botão de Voltar */}
        <div>
          <a
            href="/"
            className="inline-block mb-6 text-yellow-400 hover:text-yellow-500 font-semibold"
          >
            ← Voltar ao Dashboard
          </a>
        </div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-yellow-400"
        >
          Inteligência Artificial & Estratégia
        </motion.h1>

        {/* Subtítulo */}
        <p className="text-lg text-gray-300 text-center">
          O cérebro invisível que opera nos bastidores dos maiores mercados do
          mundo.
        </p>

        {/* Sessões */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            🎯 A disciplina do especialista
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Atuação focada entre <strong>9h e 18h</strong>, nos mercados do Brasil e EUA</li>
            <li>Poucas entradas ao dia, porém altamente assertivas</li>
            <li>Operações baseadas em estatísticas e inteligência de dados</li>
            <li>Proteção do capital sempre em primeiro lugar</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            ⚡ O poder da tecnologia
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Armazenamento massivo de dados para mapear padrões</li>
            <li>Modelos preditivos avançados com ajustes em tempo real</li>
            <li>Integração com calendário econômico global</li>
            <li>Criptografia e segurança de nível bancário</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            🦍 A filosofia da força silenciosa
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Força e disciplina contra as armadilhas do mercado</li>
            <li>Lealdade à comunidade antes de tudo</li>
            <li>Precisão cirúrgica: agir apenas quando a vitória é clara</li>
          </ul>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-yellow-300">
            📊 Resultados sustentáveis
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Rendimento-alvo entre 1,5% e 2,5% ao dia</li>
            <li>Operações baseadas em estatística e probabilidade real</li>
            <li>Estratégia feita para durar, não para apostas arriscadas</li>
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
            A Inteligência Artificial que pensa como um especialista, age como
            um profissional e protege como uma família.
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
