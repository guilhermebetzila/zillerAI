import { useEffect, useState, useRef } from "react";

const frases = [
  "Analisando seus investimentos...",
  "Calculando o crescimento composto...",
  "Otimizando sua carteira...",
  "Gerando insights personalizados...",
];

const logsFake = [
  "[INFO] Conectando à base de dados financeira...",
  "[OK] Dados carregados com sucesso.",
  "[PROCESS] Aplicando algoritmo de otimização de portfólio.",
  "[PROCESS] Atualizando métricas de risco.",
  "[ALERT] Detectado aumento no índice de investimentos.",
  "[INFO] Recalculando projeções para os próximos 30 dias.",
  "[PROCESS] Analisando rede de indicações para bônus.",
  "[INFO] Enviando notificações personalizadas.",
  "[OK] Processamento finalizado.",
];

export default function IAWorkingPanel() {
  const [textoDigitando, setTextoDigitando] = useState("");
  const [indiceFrase, setIndiceFrase] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<string[]>([]);

  // Efeito máquina de escrever
  useEffect(() => {
    if (charIndex < frases[indiceFrase].length) {
      const timeout = setTimeout(() => {
        setTextoDigitando((prev) => prev + frases[indiceFrase][charIndex]);
        setCharIndex(charIndex + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setTextoDigitando("");
        setCharIndex(0);
        setIndiceFrase((prev) => (prev + 1) % frases.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, indiceFrase]);

  // Atualiza logs simulados
  useEffect(() => {
    const interval = setInterval(() => {
      const novaLinha = logsFake[Math.floor(Math.random() * logsFake.length)];
      logsRef.current = [...logsRef.current, novaLinha].slice(-10);
      setLogs(logsRef.current);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black bg-opacity-80 border border-green-400 rounded-lg p-4 max-w-xl mx-auto font-mono text-green-400 select-none mb-6">
      <div className="mb-2 min-h-[24px] text-lg">
        {textoDigitando}
        <span className="blinking-cursor">|</span>
      </div>
      <div className="h-40 overflow-y-auto space-y-1 text-sm leading-relaxed" style={{ fontFamily: "monospace" }}>
        {logs.map((linha, i) => (
          <div key={i} className="animate-fade-in">{linha}</div>
        ))}
      </div>

      <style>{`
        .blinking-cursor {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeIn {
          from {opacity: 0;}
          to {opacity: 1;}
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
}
