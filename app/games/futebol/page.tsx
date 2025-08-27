'use client'

import { useRouter } from 'next/navigation'

export default function FutebolPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-6">⚽ Jogo de Futebol</h1>
      <p className="mb-10 text-gray-300">Aqui será o seu novo jogo de futebol!</p>

      <button
        onClick={() => router.push('/dashboard')}
        className="bg-white text-green-800 font-semibold px-6 py-3 rounded shadow-lg hover:bg-gray-100 transition"
      >
        ← Voltar ao Painel
      </button>
    </div>
  )
}
