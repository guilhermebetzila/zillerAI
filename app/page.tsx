'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import EsteiraSaques from '@/components/EsteiraSaques';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Funções do modal de confirmação de idade
  const confirmarIdade = () => setAgeConfirmed(true);
  const rejeitarIdade = () => {
    alert('Você precisa ser maior de 18 anos para acessar o site.');
    window.location.href = 'https://google.com';
  };

  if (!ageConfirmed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-lg p-6 max-w-sm text-center text-gray-100">
          <h2 className="text-xl font-bold mb-4">Você tem mais de 18 anos?</h2>
          <div className="flex justify-center gap-6">
            <button
              onClick={confirmarIdade}
              className="bg-black hover:bg-gray-800 px-6 py-2 rounded text-white font-semibold"
            >
              Sim
            </button>
            <button
              onClick={rejeitarIdade}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold"
            >
              Não
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen w-full bg-transparent text-white overflow-x-hidden font-sans">
      <EsteiraSaques />

      {/* Logo */}
      <div className="w-full flex justify-center mt-10 mb-6">
        <Image
          src="/img/betzillaa.png"
          alt="Logo BetZila"
          width={180}
          height={180}
          className="w-[140px] sm:w-[180px] h-auto rounded-xl shadow-2xl hover:scale-105 transition-transform duration-500"
          priority
        />
      </div>

      {/* Botões */}
      <div className="flex flex-wrap justify-center gap-6 mt-4 px-4">
        <Button
          onClick={() => router.push('/login')}
          className="bg-black hover:opacity-90 text-white font-extrabold text-lg px-8 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Entrar
        </Button>
        <Button
          onClick={() => router.push('/register')}
          className="bg-black hover:opacity-90 text-white font-extrabold text-lg px-8 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Registrar-se
        </Button>
      </div>

      {/* Texto Estratégico da IA */}
      <section className="max-w-4xl mx-auto mt-12 px-6 text-lg leading-relaxed text-white space-y-6">
        <h2 className="text-3xl font-extrabold text-center">
          🛡️ Nossa Empresa — A IA que Trabalha por Você
        </h2>
        <p>
          Imagine ter ao seu lado um <strong>especialista financeiro</strong> que nunca dorme, nunca se distrai e
          analisa milhões de dados por segundo. Esse especialista existe — mas não é humano. É a
          <strong> nossa Inteligência Artificial</strong>, desenvolvida para atuar no mercado financeiro de forma
          estratégica e segura.
        </p>
        <h3 className="text-2xl font-bold">📊 Como a IA Atua</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Análise de Mercados Nacionais e Internacionais:</strong> monitoramento em tempo real de bolsas de
            valores, criptomoedas e índices econômicos globais.
          </li>
          <li>
            <strong>Integração com o Calendário Econômico:</strong> antecipação de movimentos com base em eventos e
            indicadores.
          </li>
          <li>
            <strong>Carteira de Investimento Diária:</strong> montagem e ajuste automático para aproveitar as melhores
            oportunidades.
          </li>
        </ul>
        <h3 className="text-2xl font-bold">💰 Resultados Consistentes</h3>
        <p>
          Nosso foco é gerar <strong>resultados sólidos e constantes</strong>, com rendimento diário entre{' '}
          <strong>1,5% e 2,5%</strong>, mantendo segurança e preservação do capital.
        </p>
        <h3 className="text-2xl font-bold">🤝 Por que Confiar?</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Transparência total com relatórios diários.</li>
          <li>Segurança de dados com criptografia avançada.</li>
          <li>Comunidade exclusiva dE investidores.</li>
        </ul>
        <p className="text-center font-semibold text-xl">
          💡 Nossa IA Ziller observa, decide, ajusta e gera lucro para você — mesmo enquanto você dorme.
        </p>
      </section>

      {/* Rodapé */}
      <footer className="w-full bg-black text-white py-16 mt-20 border-t border-gray-600 select-none">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 px-6 text-sm sm:text-base">
          <div>
            <h3 className="font-extrabold mb-6 uppercase tracking-wide">🔹 SOBRE NÓS</h3>
            <ul className="space-y-3 leading-relaxed">
              <li
                onClick={() => router.push('/zilleria')}
                className="hover:text-yellow-500 cursor-pointer transition-colors"
              >
                O que é a Ziller.Ia
              </li>
              <li
                onClick={() => router.push('/estrategia')}
                className="hover:text-yellow-500 cursor-pointer transition-colors"
              >
                Inteligência Artificial e Estratégias
              </li>
              <li
                onClick={() => router.push('/transparencia')}
                className="hover:text-yellow-500 cursor-pointer transition-colors"
              >
                Transparência e Tecnologia
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Nossa Missão</li>
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold mb-6 uppercase tracking-wide">🔹 PRODUTOS</h3>
            <ul className="space-y-3 leading-relaxed">
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Investimento com IA</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Diversificação Inteligente</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Rendimento Diário Automatizado</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Painel do Investidor</li>
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold mb-6 uppercase tracking-wide">🔹 SUPORTE</h3>
            <ul className="space-y-3 leading-relaxed">
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Central de Ajuda</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Termos de Uso</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Política de Privacidade</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Segurança & Confiabilidade</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Contato</li>
            </ul>
          </div>
          <div>
            <h3 className="font-extrabold mb-6 uppercase tracking-wide">🔹 LEGALIDADE</h3>
            <ul className="space-y-3 leading-relaxed">
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Conformidade com PLD/CFT</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Declaração de Riscos</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Política de Dados</li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">Auditorias e Certificações</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 text-center text-gray-400 text-sm px-6 max-w-4xl mx-auto select-none">
          <div className="mb-3">🔒 Criptografia SSL 256 bits — Site Seguro</div>
          <div className="mb-3">🌐 Ziller.Ia — Todos os direitos reservados</div>
        </div>
      </footer>
    </main>
  );
}
