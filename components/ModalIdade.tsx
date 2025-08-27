'use client';

import { useState, useEffect } from 'react';

export function ModalIdade() {
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    // Mostrar modal assim que o componente montar (página abrir)
    setMostrarModal(true);
  }, []);

  function confirmarIdade(sim: boolean) {
    if (sim) {
      setMostrarModal(false);
      // Pode salvar no localStorage pra não mostrar de novo, se quiser
      localStorage.setItem('maiorDe18', 'true');
    } else {
      // Se clicou "Não", pode redirecionar ou mostrar mensagem
      alert('Você precisa ter mais de 18 anos para acessar o site.');
      // Exemplo: redirecionar para outro site
      window.location.href = 'https://google.com';
    }
  }

  // Se quiser que não apareça se já confirmou antes:
  useEffect(() => {
    const confirmado = localStorage.getItem('maiorDe18');
    if (confirmado === 'true') {
      setMostrarModal(false);
    }
  }, []);

  if (!mostrarModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60">
      <div className="bg-gray-900 p-6 rounded-lg max-w-sm text-center text-white">
        <h2 className="text-xl font-bold mb-4">Você tem mais de 18 anos?</h2>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => confirmarIdade(true)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Sim
          </button>
          <button
            onClick={() => confirmarIdade(false)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
}
