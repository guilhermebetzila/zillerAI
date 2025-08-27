'use client';

import { useRouter } from 'next/navigation';

export default function TransparenciaTecnologia() {
  const router = useRouter();

  return (
    <main className="flex flex-col min-h-screen w-full bg-black text-white px-6 py-16 font-sans">
      {/* Título */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12">
        🔹 Transparência e Tecnologia
      </h1>

      {/* Conteúdo */}
      <section className="max-w-5xl mx-auto space-y-8 text-lg leading-relaxed">
        <p>
          Na <strong>Ziller.Ia</strong>, acreditamos que a <strong>confiança nasce da clareza</strong>. 
          Por isso, cada decisão tomada por nossa Inteligência Artificial é registrada, auditada e pode 
          ser acompanhada pelo investidor em tempo real.
        </p>

        <div>
          <h2 className="text-2xl font-bold mb-3">🔍 Transparência Total</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Cada operação da IA é registrada em um <strong>livro-razão imutável</strong>, utilizando 
              tecnologia de <strong>blockchain privada</strong>, garantindo que nenhum dado possa ser alterado.
            </li>
            <li>
              Investidores têm acesso a <strong>relatórios detalhados e dashboards dinâmicos</strong>, 
              com horários de entrada/saída, justificativas da IA e desempenho consolidado.
            </li>
            <li>
              Nossos algoritmos passam por <strong>auditorias independentes</strong>, assegurando que os 
              resultados divulgados correspondem exatamente às operações executadas.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">⚙️ Tecnologia de Alta Performance</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Utilizamos <strong>Redes Neurais Profundas (Deep Learning)</strong> para analisar milhões 
              de combinações de indicadores financeiros em frações de segundo.
            </li>
            <li>
              O sistema aplica <strong>Machine Learning Reforçado</strong>, aprendendo continuamente com 
              erros e acertos para garantir operações cada vez mais inteligentes.
            </li>
            <li>
              Infraestrutura em <strong>servidores de alta disponibilidade</strong> com balanceamento automático 
              de carga — nossa IA nunca para, mesmo em picos de mercado.
            </li>
            <li>
              Protocolos de <strong>segurança militar</strong> (AES-256 + TLS 1.3) protegem dados e operações 
              contra qualquer tentativa de ataque.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">💡 Para todos entenderem</h2>
          <p>
            Imagine uma equipe de milhares de especialistas financeiros, matemáticos e engenheiros 
            trabalhando 24 horas por dia sem descanso. Essa é a nossa IA.  
            Diferente de humanos, ela não se cansa, não se distrai e nunca toma decisões baseadas em emoção — 
            apenas em <strong>dados sólidos e estratégias comprovadas</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3">⚡ O Resultado</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Operações seguras e transparentes.</li>
            <li>Decisões assertivas nos horários de maior movimentação (9h às 18h, Brasil e EUA).</li>
            <li>Confiança absoluta com acompanhamento em tempo real.</li>
          </ul>
        </div>

        <p className="text-center font-semibold text-xl mt-10">
          📢 Na <strong>Ziller.Ia</strong>, <em>transparência não é uma promessa, é um sistema</em>.  
          E nossa tecnologia é o que transforma estratégia em resultado real.
        </p>
      </section>

      {/* Botão voltar */}
      <div className="flex justify-center mt-16">
        <button
          onClick={() => router.push('/')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1"
        >
          ⬅️ Voltar para Home
        </button>
      </div>
    </main>
  );
}
