// context/AuthContext.tsx
"use client"

import { createContext, useContext, ReactNode, useState } from "react"

type User = {
  id: string
  nome: string
  email: string
  saldo: number
}

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}
