'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const nomes = ['Lucas', 'Ana', 'Carlos', 'Fernanda', 'João', 'Paula', 'Guilherme', 'Sofia'];
const jogos = [
  { name: 'Slot Tigrinho', image: '/img/jogo1.png' },
  { name: 'Dados Dourados', image: '/img/jogo2.png' },
  { name: 'Roleta Turbo', image: '/img/jogo3.png' },
  { name: 'Touros Loucos', image: '/img/jogo4.png' },
];

function gerarItem() {
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const valor = 200 + Math.floor(Math.random() * 800);
  const jogo = jogos[Math.floor(Math.random() * jogos.length)];
  return { nome, valor, jogo };
}

export default function WinningTicker() {
  const [ganhos, setGanhos] = useState(() =>
    Array.from({ length: 10 }, gerarItem)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setGanhos((prev) => [...prev.slice(1), gerarItem()]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#121826] py-2 overflow-hidden relative border-y border-yellow-500 mb-10">
      <div className="flex animate-marquee gap-4 whitespace-nowrap px-4">
        {ganhos.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded-xl shadow min-w-max"
          >
            <Image
              src={item.jogo.image}
              alt={item.jogo.name}
              width={36}
              height={36}
              className="rounded"
            />
            <div className="text-white text-sm">
              <p><strong className="text-yellow-400">{item.nome}</strong> ganhou <strong>R$ {item.valor}</strong></p>
              <p className="text-xs text-gray-400">{item.jogo.name}</p>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
