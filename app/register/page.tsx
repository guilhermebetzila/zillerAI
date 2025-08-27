'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

function FormularioRegistro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [indicador, setIndicador] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Validação senha
  const [hasUpper, setHasUpper] = useState(false)
  const [hasLower, setHasLower] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)
  const [hasSpecial, setHasSpecial] = useState(false)

  // Carregar indicador da URL ou localStorage
  useEffect(() => {
    const indicacaoURL = searchParams.get('indicador')
    if (indicacaoURL) {
      localStorage.setItem('indicador', indicacaoURL)
      setIndicador(indicacaoURL)
    } else {
      const local = localStorage.getItem('indicador')
      if (local) setIndicador(local)
    }
  }, [searchParams])

  useEffect(() => {
    setHasUpper(/[A-Z]/.test(password))
    setHasLower(/(?:.*[a-z]){2,}/.test(password))
    setHasNumber(/\d/.test(password))
    setHasSpecial(/[!@#$%^&*()_+\[\]{};:'",.<>\/?\\|-]/.test(password))
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    const payload = {
      name: name.trim(),
      email: email.trim(),
      cpf: cpf.trim(),
      password: password.trim(),
      indicador: indicador.trim() || null,
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        const data = await res.json()
        setErro(data?.message || 'Erro ao registrar')
      }
    } catch {
      setErro('Erro de conexão com o servidor')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Registrar</h1>

      {indicador && (
        <p className="mb-2 text-green-600">
          Você está sendo indicado por: <strong>{indicador}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />

        {/* Regras visuais */}
        <div className="text-sm space-y-1">
          <p className={hasUpper ? 'text-green-600' : 'text-red-500'}>
            • Pelo menos 1 letra maiúscula
          </p>
          <p className={hasLower ? 'text-green-600' : 'text-red-500'}>
            • Pelo menos 2 letras minúsculas
          </p>
          <p className={hasNumber ? 'text-green-600' : 'text-red-500'}>
            • Pelo menos 1 número
          </p>
          <p className={hasSpecial ? 'text-green-600' : 'text-red-500'}>
            • Pelo menos 1 caractere especial
          </p>
        </div>

        <input
          type="text"
          placeholder="Indicador (opcional)"
          value={indicador}
          onChange={(e) => setIndicador(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          readOnly={!!searchParams.get('indicador')}
        />
        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
        >
          Registrar
        </button>
      </form>
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<p className="text-center">Carregando...</p>}>
      <FormularioRegistro />
    </Suspense>
  )
}
