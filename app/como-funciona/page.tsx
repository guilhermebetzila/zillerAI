'use client';

import { FaBrain, FaChartLine, FaShieldAlt, FaUsers, FaRocket } from 'react-icons/fa';

export default function ComoFunciona() {
  return (
    <div className="bg-gray-950 text-white min-h-screen">
      {/* Hero */}
      <section className="text-center py-16 px-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-yellow-400">
          ⚙️ Como Funciona a Ziller
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
          Tecnologia, estratégia e transparência para entregar resultados consistentes e sustentáveis no mercado financeiro.
        </p>
      </section>

      {/* Seções */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        
        {/* Inteligência Artificial */}
        <section className="text-center">
          <FaBrain className="text-yellow-400 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">🧠 O Coração: Nossa Inteligência Artificial</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A IA Ziller monitora os mercados 24/7, sem emoção ou distração. Analisa bolsas, moedas e criptomoedas,
            integra o calendário econômico e lê candles com precisão. Atua com poucas entradas, mas sempre assertivas.
          </p>
        </section>

        {/* Estratégia */}
        <section className="text-center">
          <FaChartLine className="text-yellow-400 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">💰 A Estratégia: Lucro Sustentável</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Foco em preservar o capital e gerar ganhos consistentes. Rentabilidade diária entre
            <span className="text-yellow-400 font-bold"> 1,5% e 2,5%</span>, controle rígido de risco
            e divisão de lucros de forma equilibrada e segura.
          </p>
        </section>

        {/* Transparência */}
        <section className="text-center">
          <FaShieldAlt className="text-yellow-400 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">🔒 Transparência Total</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Relatórios diários, acesso ao <span className="text-yellow-400 font-bold">Bolsão da Empresa</span> e entregas
            trimestrais detalhadas de operações, lucros, perdas e projeções. Aqui a confiança é prática, não discurso.
          </p>
        </section>

        {/* Comunidade */}
        <section className="text-center">
          <FaUsers className="text-yellow-400 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">👥 Comunidade e Aprendizado</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Mentorias exclusivas, comunidade privada de investidores e treinamentos contínuos.
            Na Ziller, cada investidor evolui junto com o ecossistema.
          </p>
        </section>

        {/* Diferencial */}
        <section className="text-center">
          <FaRocket className="text-yellow-400 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">🚀 O Diferencial Ziller</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Exclusividade garantida com limite de <span className="text-yellow-400 font-bold">100 mil usuários</span>,
            representados pelo gorila — símbolo de força, família e lealdade.
            Tecnologia, transparência e comunidade em um só lugar.
          </p>
        </section>
      </div>

      {/* Conclusão */}
      <section className="bg-gray-900 text-center py-16 px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-yellow-400">
          ✅ Conclusão
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-300 mb-6">
          O funcionamento da Ziller é simples, mas poderoso: <br />
          <span className="font-bold text-yellow-400">
            Tecnologia de ponta + Estratégia inteligente + Transparência total.
          </span>
        </p>
        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          Aqui você sabe exatamente como seu dinheiro está sendo multiplicado. Sem mágica, sem promessas vazias.
          Apenas disciplina, inovação e a força da comunidade Ziller.
        </p>
        <h3 className="text-2xl font-bold text-white">
          🦍 Ziller — Inteligência que trabalha por você.
        </h3>
      </section>
    </div>
  );
}
