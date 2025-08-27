'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  nome: string
  email: string
  saldo: number
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        nome: session.user.nome,
        email: session.user.email,
        saldo: session.user.saldo
      })
    } else {
      setUser(null)
    }

    setLoading(false)
  }, [session, status])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}
