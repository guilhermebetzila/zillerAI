'use client'

import React, { useState } from 'react'
import InputMask from 'react-input-mask'

interface CampoCPFProps {
  cpfInicial?: string
  onSalvar: (cpf: string) => void
}

export default function CampoCPF({ cpfInicial = '', onSalvar }: CampoCPFProps) {
  const [cpf, setCpf] = useState(cpfInicial)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const validarCPF = (valor: string) => {
    const cpfLimpo = valor.replace(/[^\d]/g, '')
    return cpfLimpo.length === 11
  }

  const handleSalvar = async () => {
    if (!validarCPF(cpf)) {
      setErro('CPF inválido. Digite os 11 dígitos corretamente.')
      return
    }

    setSalvando(true)
    setErro(null)
    try {
      await onSalvar(cpf)
    } catch {
      setErro('Erro ao salvar CPF.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md max-w-md mx-auto mt-6 border border-green-500">
      <label htmlFor="cpf" className="block text-sm font-medium text-gray-300 mb-2">
        🧾 Digite seu CPF para continuar operando:
      </label>
      <InputMask
        mask="999.999.999-99"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      >
        {/* Apenas o input, sem função */}
        <input
          id="cpf"
          type="text"
          placeholder="000.000.000-00"
          className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </InputMask>
      {erro && <p className="text-red-500 text-sm mt-2">{erro}</p>}
      <button
        onClick={handleSalvar}
        disabled={salvando}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md w-full disabled:opacity-60"
      >
        {salvando ? 'Salvando...' : '💾 Salvar CPF'}
      </button>
    </div>
  )
}
