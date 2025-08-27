'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ConviteClientProps {
  nomeDoUsuario: string
}

export default function ConviteClient({ nomeDoUsuario }: ConviteClientProps) {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem('indicador', nomeDoUsuario)
    router.push('/registro')
  }, [nomeDoUsuario, router])

  return <p className="text-white p-6">Carregando convite...</p>
}
