'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@ui/button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Simulação de requisição de recuperação
    setTimeout(() => {
      setLoading(false);
      if (email.trim() === '') {
        setMessage('⚠️ Por favor, insira um e-mail válido.');
      } else {
        setMessage('✅ Link de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
      }
    }, 1500);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 font-sans">
      {/* Logo */}
      <div className="mb-10">
        <img
          src="/img/betzillaa.png"
          alt="BetZila Logo"
          className="w-32 sm:w-40 mx-auto rounded-xl shadow-2xl hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Card */}
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-4 text-yellow-400">
          Recuperar Senha
        </h1>
        <p className="text-center text-gray-300 mb-6">
          Digite o e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
              loading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-400 text-black'
            }`}
          >
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 font-medium ${
              message.startsWith('✅') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/login')}
            className="text-yellow-400 hover:underline hover:text-yellow-300 transition"
          >
            Voltar para o login
          </button>
        </div>
      </div>

      <footer className="mt-16 text-gray-500 text-sm text-center">
        <p>© {new Date().getFullYear()} BetZila — Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
