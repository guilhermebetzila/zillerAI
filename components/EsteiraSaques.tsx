'use client';

import { useEffect, useState } from 'react';

const nomes = [
  'João G.', 'Ana P.', 'Rafael M.', 'Bruna L.', 'Carlos S.', 'Larissa K.', 'Pedro T.',
  'Marina C.', 'Lucas H.', 'Camila V.', 'Felipe A.', 'Juliana N.', 'Eduardo F.'
];

function gerarValorAleatorio() {
  return Math.floor(Math.random() * (5000 - 53 + 1)) + 53;
}

function gerarMensagensAleatorias(qtd = 30) {
  const mensagens = [];
  for (let i = 0; i < qtd; i++) {
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const valor = gerarValorAleatorio().toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    mensagens.push(`${nome} sacou ${valor}`);
  }
  return mensagens;
}

export default function EsteiraSaques() {
  const [mensagens, setMensagens] = useState<string[]>([]);

  useEffect(() => {
    const msgs = gerarMensagensAleatorias(50);
    setMensagens(msgs);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-black text-white py-2 text-sm">
      <div className="animate-marquee whitespace-nowrap">
        {mensagens.map((msg, idx) => (
          <span key={idx} className="mx-4 inline-block">
            {msg} •
          </span>
        ))}
      </div>
    </div>
  );
}
