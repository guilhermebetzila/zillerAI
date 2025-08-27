'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, User } from "lucide-react"
import Image from "next/image"
import { RegisterModal } from "@/components/register-modal"
import { LoginModal } from "@/components/login-modal"

export function MainHeader() {
  const [userCount, setUserCount] = useState(5456)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + 1)
    }, Math.random() * 8000 + 3000)

    return () => clearInterval(interval)
  }, [])

  const formatUserCount = (count: number) => {
    return count.toLocaleString("pt-BR")
  }

  return (
    <header className="bg-green-800 border-b border-green-700">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Logo e navegação */}
        <div className="flex items-center gap-8">
          <Image
            src="/betdreams-logo.png"
            alt="BetDreams"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
            unoptimized
          />

          <nav className="flex gap-6 text-sm font-medium">
            <button className="text-cyan-400 border-b-2 border-cyan-400 pb-1 transition">
              Todos os Esportes
            </button>
            <button className="text-gray-200 hover:text-white transition">Ao-Vivo</button>
            <button className="text-gray-200 hover:text-white transition">Cassino</button>
          </nav>
        </div>

        {/* Ações do topo */}
        <div className="flex items-center gap-4">
          {/* Contador de usuários */}
          <div className="flex items-center gap-2 bg-green-700 px-3 py-1.5 rounded-full">
            <Users className="h-4 w-4 text-green-300" />
            <div className="flex flex-col">
              <span className="text-xs text-green-300">Usuários Online</span>
              <span className="text-sm font-bold text-white">{formatUserCount(userCount)}</span>
            </div>
          </div>

          {/* Botões de ação */}
          <Button
            variant="outline"
            className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent flex gap-2 items-center"
            onClick={() => setShowRegisterModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            Registre-se
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white flex gap-2 items-center"
            onClick={() => setShowLoginModal(true)}
          >
            <User className="w-4 h-4" />
            Login
          </Button>
        </div>
      </div>

      {/* Modais */}
      <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenRegister={() => setShowRegisterModal(true)}
        // onLoginSuccess={(userData) => console.log("Login OK:", userData)}
      />
    </header>
  )
}
