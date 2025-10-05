'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrCpf, setEmailOrCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    if (!emailOrCpf || !senha) {
      setMensagem('Todos os campos são obrigatórios.');
      setCarregando(false);
      return;
    }

    const result = await signIn('credentials', {
      email: emailOrCpf,
      password: senha,
      redirect: false, // mudamos para false para controlar os erros manualmente
    });

    if (result?.error) {
      if (result.error === 'Credenciais inválidas') {
        setMensagem('Senha incorreta');
      } else {
        setMensagem(result.error);
      }
      setCarregando(false);
      return;
    }

    // Login bem-sucedido
    router.push('/dashboard');
  };

  const handleForgotPassword = () => {
    setForgotLoading(true);
    setTimeout(() => {
      router.push('/games/forgot-password');
    }, 150);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <input
            type="text"
            placeholder="Email ou CPF"
            value={emailOrCpf}
            onChange={(e) => setEmailOrCpf(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition-colors duration-200"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition-colors duration-200"
            required
          />
        </div>

        {/* Link "Esqueci minha senha" */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-yellow-400 text-sm mt-2 hover:underline hover:text-yellow-300 transition-all duration-300 flex items-center"
            disabled={forgotLoading}
          >
            {forgotLoading ? <span className="animate-pulse">Redirecionando...</span> : 'Esqueci minha senha'}
          </button>
        </div>

        <button
          type="submit"
          className={`w-full py-2 rounded text-white transition-all duration-300 ${
            carregando ? 'bg-green-700 cursor-not-allowed animate-pulse' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {mensagem && (
        <p className="mt-4 text-sm text-red-400 text-center transition-opacity duration-300">{mensagem}</p>
      )}
    </main>
  );
}
