'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SaquePage() {
  const [valor, setValor] = useState('')
  const [carteira, setCarteira] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carteiraSalva, setCarteiraSalva] = useState('')
  const router = useRouter()

  // Carregar carteira salva no navegador
  useEffect(() => {
    const savedWallet = localStorage.getItem('usdt_wallet')
    if (savedWallet) setCarteiraSalva(savedWallet)
  }, [])

  // Enviar pedido de saque para API
  const handleSaque = async () => {
    if (!valor || parseFloat(valor) <= 0) {
      setMensagem('❌ Digite um valor válido para saque.')
      return
    }

    if (!carteiraSalva) {
      setMensagem('⚠️ Cadastre uma carteira USDT antes de sacar.')
      return
    }

    try {
      const res = await fetch('/api/saque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: parseFloat(valor),
          carteira: carteiraSalva
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setMensagem(`❌ Erro: ${data.error || 'Não foi possível solicitar saque.'}`)
        return
      }

      setMensagem(`✅ Pedido de saque de ${valor} USDT enviado para a carteira: ${carteiraSalva}`)
      setValor('')
    } catch (error) {
      setMensagem('❌ Erro de conexão com servidor.')
    }
  }

  // Salvar carteira USDT local
  const salvarCarteira = () => {
    if (!carteira) {
      setMensagem('❌ Digite uma carteira USDT válida.')
      return
    }

    localStorage.setItem('usdt_wallet', carteira)
    setCarteiraSalva(carteira)
    setCarteira('')
    setMensagem('✅ Carteira USDT salva com sucesso!')
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-4">📤 Tela de Saque</h1>
      <p className="mb-6 text-gray-400">Solicite saques em USDT para sua carteira.</p>

      {/* Formulário de saque */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
        <label className="block mb-2 font-semibold">💸 Valor do Saque (USDT)</label>
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Digite o valor em USDT"
          className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <button
          onClick={handleSaque}
          className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded font-semibold transition duration-300"
        >
          📤 Solicitar Saque
        </button>
      </div>

      {/* Cadastro da carteira */}
      <div className="bg-gray-800 mt-6 p-6 rounded-lg shadow-md w-full max-w-md">
        <label className="block mb-2 font-semibold">🔐 Cadastrar Carteira USDT (TRC20)</label>
        <input
          type="text"
          value={carteira}
          onChange={(e) => setCarteira(e.target.value)}
          placeholder="Endereço da carteira USDT (TRC20)"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
        />
        <button
          onClick={salvarCarteira}
          className="bg-green-600 hover:bg-green-700 w-full py-2 rounded font-semibold transition duration-300"
        >
          💾 Salvar Carteira
        </button>

        {carteiraSalva && (
          <p className="mt-4 text-sm text-gray-300 text-center">
            ✅ Carteira cadastrada: <strong>{carteiraSalva}</strong>
          </p>
        )}
      </div>

      {/* Mensagem de retorno */}
      {mensagem && (
        <p className="mt-6 text-sm text-yellow-400 text-center">{mensagem}</p>
      )}

      <button
        onClick={() => router.push('/dashboard')}
        className="mt-8 bg-white text-black px-6 py-2 rounded hover:bg-gray-100 transition"
      >
        ← Voltar para o Painel
      </button>
    </div>
  )
}
