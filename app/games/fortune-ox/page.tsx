'use client';

import React, { useState } from 'react';

const SYMBOLS = ['🐂', '🍀', '🧧', '🪙', '🎉', '🔔', '💰', '🐉'];
const REELS = 5;
const ROWS = 3;

function getRandomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

export default function FortuneOxPage() {
  // matriz 3x5 para os símbolos dos rolos
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: ROWS }, () => Array.from({ length: REELS }, getRandomSymbol))
  );

  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState('');

  function spin() {
    if (spinning) return; // evitar clicar várias vezes

    setSpinning(true);
    setMessage('');

    // simular animação de rolar por 1.5s
    setTimeout(() => {
      const newGrid = Array.from({ length: ROWS }, () =>
        Array.from({ length: REELS }, getRandomSymbol)
      );
      setGrid(newGrid);

      // Verificar linhas vencedoras (exemplo: linha 0 ganha se todos os símbolos forem iguais)
      const winner = newGrid.some(row => row.every(sym => sym === row[0]));

      setMessage(winner ? '🎉 Parabéns! Linha vencedora!' : '😞 Tente novamente.');
      setSpinning(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl mb-6 font-bold">🐂 Fortune Ox - Slot Machine</h1>

      <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
        {/* Grid 3 linhas x 5 colunas */}
        <div className="grid grid-rows-3 grid-cols-5 gap-2 text-5xl text-center select-none">
          {grid.map((row, rowIndex) =>
            row.map((symbol, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="bg-yellow-400 text-black rounded-lg flex items-center justify-center"
              >
                {symbol}
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className={`mt-8 px-6 py-3 rounded-lg text-lg font-bold ${
          spinning ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-400 text-black hover:bg-yellow-300'
        } transition-colors duration-300`}
      >
        {spinning ? 'Girando...' : 'Girar'}
      </button>

      {message && <p className="mt-6 text-xl">{message}</p>}
    </div>
  );
}
