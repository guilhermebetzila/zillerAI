'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    if (!email || !senha) {
      setMensagem('Todos os campos são obrigatórios.');
      setCarregando(false);
      return;
    }

    const result = await signIn('credentials', {
      email,
      password: senha, // 🔑 precisa ser "password"
      callbackUrl: '/dashboard', // ✅ redireciona automático
    });

    if (result?.error) {
      setMensagem('Email ou senha incorreta.');
      setCarregando(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {mensagem && (
        <p className="mt-4 text-sm text-red-400 text-center">{mensagem}</p>
      )}
    </main>
  );
}
