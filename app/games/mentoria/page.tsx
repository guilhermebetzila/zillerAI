'use client';

import React from 'react';

export default function MentoriaPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6 space-y-12">

      {/* Barra de Mentoria */}
      <header className="w-full max-w-4xl flex items-center justify-center bg-black border border-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide text-white">
          Mentoria
        </h1>
      </header>

      {/* Quadrados das Aulas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Aula 1 */}
        <div className="bg-black border border-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:scale-105 cursor-pointer transition-transform">
          <div className="w-32 h-32 bg-black border border-white rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">Aula 1</span>
          </div>
          <p className="text-center font-semibold text-lg text-white">Introdução ao Controle Financeiro</p>
        </div>

        {/* Aula 2 */}
        <div className="bg-black border border-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:scale-105 cursor-pointer transition-transform">
          <div className="w-32 h-32 bg-black border border-white rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">Aula 2</span>
          </div>
          <p className="text-center font-semibold text-lg text-white">Desenvolvendo sua Saúde Emocional</p>
        </div>

        {/* Aula 3 */}
        <div className="bg-black border border-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:scale-105 cursor-pointer transition-transform">
          <div className="w-32 h-32 bg-black border border-white rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">Aula 3</span>
          </div>
          <p className="text-center font-semibold text-lg text-white">Tomando Controle da Sua Vida</p>
        </div>
      </div>

      {/* Frase de impacto */}
      <div className="max-w-3xl text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Aprenda a cuidar e desenvolver sua saúde financeira e emocional, tomando controle da sua vida de forma consciente e poderosa.
        </h2>
      </div>
    </div>
  );
}
