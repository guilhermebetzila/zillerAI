'use client';

import { useState } from 'react';

interface AgeGateProps {
  onConfirm: () => void;
  onReject: () => void;
}

export default function AgeGate({ onConfirm, onReject }: AgeGateProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleConfirm = () => {
    setVisible(false);
    onConfirm();
  };

  const handleReject = () => {
    alert('Você precisa ser maior de 18 anos para acessar o site.');
    // Pode redirecionar ou bloquear o acesso aqui
    onReject();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-sm text-center text-gray-100">
        <h2 className="text-xl font-bold mb-4">Você tem mais de 18 anos?</h2>
        <div className="flex justify-center gap-6">
          <button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
          >
            Sim
          </button>
          <button
            onClick={handleReject}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold"
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
}
