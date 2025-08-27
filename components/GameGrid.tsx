'use client';

import Image from 'next/image';

const games = [
  { id: 1, name: 'Jogo 1', image: '/img/jogo1.png' },
  { id: 2, name: 'Jogo 2', image: '/img/jogo2.png' },
  { id: 3, name: 'Jogo 3', image: '/img/jogo3.png' },
  { id: 4, name: 'Jogo 4', image: '/img/jogo4.png' },
  { id: 5, name: 'Jogo 5', image: '/img/jogo5.png' },
  { id: 6, name: 'Jogo 6', image: '/img/jogo6.png' },
  { id: 7, name: 'Jogo 7', image: '/img/jogo7.png' },
  { id: 8, name: 'Jogo 8', image: '/img/jogo8.png' },
];

export default function GameGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {games.map((game) => (
        <div
          key={game.id}
          className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
        >
          <Image
            src={game.image}
            alt={game.name}
            width={300}
            height={200}
            className="object-cover w-full h-40"
          />
        </div>
      ))}
    </div>
  );
}
