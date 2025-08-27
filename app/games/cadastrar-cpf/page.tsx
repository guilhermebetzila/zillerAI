'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function CadastrarCpfPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [loading, setLoading] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.cpf) setCpf(data.user.cpf);
          if (data.user?.telefone) setTelefone(data.user.telefone);
          if (data.user?.dataNascimento) setDataNascimento(data.user.dataNascimento);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    }
    fetchUser();
  }, [router]);

  // --- Máscaras ---
  function formatCpf(value: string) {
    let v = value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  }

  function formatTelefone(value: string) {
    let v = value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d)/, '$1-$2');
    return v;
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCpf(e.target.value));
    setMensagem('');
    setErro(false);
  }

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTelefone(formatTelefone(e.target.value));
    setMensagem('');
    setErro(false);
  }

  function handleDataNascimentoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDataNascimento(e.target.value);
    setMensagem('');
    setErro(false);
  }

  // --- Validações ---
  function validarCpf(cpf: string) {
    return cpf.replace(/\D/g, '').length === 11;
  }

  function validarTelefone(tel: string) {
    return tel.replace(/\D/g, '').length === 11;
  }

  function validarIdade(data: string) {
    if (!data) return false;
    const hoje = new Date();
    const nascimento = new Date(data);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    const diaDiff = hoje.getDate() - nascimento.getDate();
    return idade > 18 || (idade === 18 && (mesDiff > 0 || (mesDiff === 0 && diaDiff >= 0)));
  }

  // --- Salvar ---
  async function salvarDados() {
    if (!validarCpf(cpf)) {
      setMensagem('❌ CPF inválido.');
      setErro(true);
      return;
    }
    if (!validarTelefone(telefone)) {
      setMensagem('❌ Telefone inválido.');
      setErro(true);
      return;
    }
    if (!validarIdade(dataNascimento)) {
      setMensagem('❌ Você precisa ter pelo menos 18 anos.');
      setErro(true);
      return;
    }

    setLoading(true);
    setMensagem('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/atualizar-cpf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, telefone, dataNascimento }),
        credentials: 'include',
      });
      if (res.ok) {
        setMensagem('✅ Dados salvos com sucesso!');
        setErro(false);
        setTimeout(() => router.push('/investir'), 1500);
      } else {
        setMensagem('❌ Erro ao salvar dados.');
        setErro(true);
      }
    } catch {
      setMensagem('❌ Erro ao salvar dados.');
      setErro(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0d1a] flex flex-col items-center justify-center px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-4 text-green-500">📝 Complete seus dados</h1>

      <p className="mb-6 text-gray-300 text-center max-w-md">
        Para sua segurança e conformidade, precisamos validar seu CPF, telefone e idade. Seus dados
        são criptografados e utilizados apenas para segurança, seguindo padrões de grandes instituições.
      </p>

      <div className="w-full max-w-md bg-[#1a1d2e] rounded-xl p-6 shadow-lg space-y-4">
        <div>
          <label className="block mb-2 font-semibold text-gray-300">CPF:</label>
          <input
            type="text"
            maxLength={14}
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            className={`w-full rounded-md p-3 text-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
              erro ? 'focus:ring-red-500' : 'focus:ring-green-500'
            } text-white`}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-300">Telefone:</label>
          <input
            type="text"
            maxLength={15}
            value={telefone}
            onChange={handleTelefoneChange}
            placeholder="(00) 00000-0000"
            className={`w-full rounded-md p-3 text-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
              erro ? 'focus:ring-red-500' : 'focus:ring-green-500'
            } text-white`}
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-300">Data de Nascimento:</label>
          <input
            type="date"
            value={dataNascimento}
            onChange={handleDataNascimentoChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full rounded-md p-3 text-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
              erro ? 'focus:ring-red-500' : 'focus:ring-green-500'
            } text-white`}
          />
        </div>

        <button
          onClick={salvarDados}
          disabled={loading}
          className="mt-2 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold shadow-md disabled:opacity-60 transition"
        >
          {loading ? 'Salvando...' : 'Salvar Dados'}
        </button>

        {mensagem && (
          <p className={`mt-4 text-center select-none ${erro ? 'text-red-500' : 'text-green-400'}`}>
            {mensagem}
          </p>
        )}
      </div>
    </main>
  );
}
