'use client'

import { useState, useEffect } from "react"
import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { Users, Menu, Bell, User, Search, Wallet, LogOut, UserPlus } from "lucide-react"
import Image from "next/image"
import { RegisterModal } from "@components/register-modal"
import { LoginModal } from "@components/login-modal"
import { SessionTimeoutManager } from "@components/session-timeout-manager"

export function MobileHeader() {
  const [userCount, setUserCount] = useState(5456)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [userBalance, setUserBalance] = useState(1250.75)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [isRemembered, setIsRemembered] = useState(false)

  useEffect(() => {
    checkSavedLogin()
  }, [])

  const checkSavedLogin = () => {
    try {
      const savedLogin = localStorage.getItem("betdreams_login")
      if (savedLogin) {
        const loginData = JSON.parse(savedLogin)
        const now = Date.now()
        const sevenDays = 7 * 24 * 60 * 60 * 1000

        if (loginData.isLoggedIn && loginData.rememberMe && now - loginData.timestamp < sevenDays) {
          setIsLoggedIn(true)
          setUserName(loginData.userData.name)
          setIsRemembered(true)
        } else {
          localStorage.removeItem("betdreams_login")
        }
      }
    } catch (error) {
      console.error("Erro ao verificar login salvo:", error)
      localStorage.removeItem("betdreams_login")
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + 1)
    }, Math.random() * 8000 + 3000)

    return () => clearInterval(interval)
  }, [])

  const formatUserCount = (count: number) => count.toLocaleString("pt-BR")

  const formatBalance = (balance: number) =>
    balance.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })

  const handleLoginSuccess = (userData: { name: string; email: string }) => {
    setIsLoggedIn(true)
    setUserName(userData.name)
    setShowLoginModal(false)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("")
    setUserBalance(0)
    setIsRemembered(false)
    localStorage.removeItem("betdreams_login")
  }

  const handleExtendSession = () => {
    if (isRemembered) {
      try {
        const savedLogin = localStorage.getItem("betdreams_login")
        if (savedLogin) {
          const loginData = JSON.parse(savedLogin)
          loginData.timestamp = Date.now()
          localStorage.setItem("betdreams_login", JSON.stringify(loginData))
        }
      } catch (error) {
        console.error("Erro ao estender sessão:", error)
      }
    }
  }

  return (
    <div className="bg-green-800 border-b border-green-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo e Menu */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700 h-8 w-8">
            <Menu className="h-5 w-5" />
          </Button>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT_Image_4_07_2025__14_28_44-removebg-preview-C2FjYDMllgQGDzdnB1rRTeA1CNpZiH.png"
            alt="BetDreams"
            width={80}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </div>

        {/* Ações do usuário */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-green-700 px-2 py-1 rounded-full">
            <Users className="h-3 w-3 text-green-300" />
            <span className="text-xs font-bold text-white">{formatUserCount(userCount)}</span>
          </div>

          <Button variant="ghost" size="icon" className="text-white hover:bg-green-700 h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>

          {isLoggedIn ? (
            <div className="flex items-center gap-1">
              {isRemembered && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Login automático ativo" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-green-700 h-8 w-8 relative group"
                onClick={handleLogout}
                title={`${userName} - Clique para sair`}
              >
                <User className="h-4 w-4 text-green-400" />
                <LogOut className="h-3 w-3 absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 rounded-full p-0.5" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-green-700 h-8 w-8"
                onClick={() => setShowLoginModal(true)}
                title="Entrar"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-green-700 h-8 w-8"
                onClick={() => setShowRegisterModal(true)}
                title="Registrar-se"
              >
                <UserPlus className="h-4 w-4 text-yellow-400" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar esportes, jogos..."
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-9"
            />
          </div>

          {isLoggedIn && (
            <div className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 min-w-[100px] cursor-pointer hover:bg-gray-600 transition-colors relative">
              {isRemembered && (
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-green-800"
                  title="Login salvo"
                />
              )}
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-400" />
                <div className="text-right">
                  <div className="text-xs text-gray-300">Saldo</div>
                  <div className="text-sm font-bold text-white">{formatBalance(userBalance)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && isRemembered && (
        <div className="px-4 pb-2">
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-xs text-yellow-300">Login automático ativo por mais 7 dias</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-2">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          <button className="text-cyan-400 border-b-2 border-cyan-400 pb-1 font-medium text-sm whitespace-nowrap">
            Esportes
          </button>
          <button className="text-gray-200 hover:text-white text-sm whitespace-nowrap">Ao-Vivo</button>
          <button className="text-gray-200 hover:text-white text-sm whitespace-nowrap">Cassino</button>
          <button className="text-gray-200 hover:text-white text-sm whitespace-nowrap">Slots</button>
          <button className="text-gray-200 hover:text-white text-sm whitespace-nowrap">Promoções</button>
        </div>
      </div>

      <RegisterModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenRegister={() => setShowRegisterModal(true)}
        onLoginSuccess={handleLoginSuccess}
      />
      <SessionTimeoutManager
        isLoggedIn={isLoggedIn}
        isRemembered={isRemembered}  
        onLogout={handleLogout}
        onExtendSession={handleExtendSession}
      />
    </div>
  )
}
