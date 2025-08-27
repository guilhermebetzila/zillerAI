'use client'

import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'

export default function TesteSessao() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const carregar = async () => {
      const sessao = await getSession()
      console.log('Sessão:', sessao)
      setSession(sessao)
    }

    carregar()
  }, [])

  return (
    <pre className="text-white p-6">
      {session ? JSON.stringify(session, null, 2) : 'Carregando sessão...'}
    </pre>
  )
}
