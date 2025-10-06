'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ui/button';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmar) {
      setMensagem('⚠️ As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setMensagem(null);

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: params.token, senha }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMensagem('✅ Senha redefinida com sucesso!');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setMensagem(`❌ ${data.error || 'Erro ao redefinir senha.'}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          Redefinir Senha
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
          />
          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
            }`}
          >
            {loading ? 'Salvando...' : 'Redefinir Senha'}
          </Button>
        </form>

        {mensagem && (
          <p
            className={`text-center mt-4 font-medium ${
              mensagem.startsWith('✅') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {mensagem}
          </p>
        )}
      </div>
    </main>
  );
}
