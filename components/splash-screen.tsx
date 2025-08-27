"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

interface SplashScreenProps {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [showLogo, setShowLogo] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Mostrar logo após pequeno delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true)
    }, 300)

    // Simular carregamento (mais rápido no mobile)
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          // Iniciar fade out
          setTimeout(() => {
            setFadeOut(true)
            // Completar após animação de fade
            setTimeout(() => {
              onComplete()
            }, 600)
          }, 300)
          return 100
        }
        return prev + Math.random() * 20 + 8
      })
    }, 150)

    return () => {
      clearTimeout(logoTimer)
      clearInterval(progressTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center justify-center z-50 transition-opacity duration-600 px-4 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background Pattern - Otimizado para mobile */}
      <div className="absolute inset-0 opacity-8 md:opacity-10">
        <div className="absolute top-10 left-10 md:top-20 md:left-20 w-20 h-20 md:w-32 md:h-32 bg-yellow-400 rounded-full blur-2xl md:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 md:bottom-32 md:right-32 w-24 h-24 md:w-40 md:h-40 bg-green-400 rounded-full blur-2xl md:blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 md:w-24 md:h-24 bg-white rounded-full blur-xl md:blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Logo Container - Responsivo */}
      <div
        className={`relative mb-8 md:mb-12 transition-all duration-800 ${
          showLogo ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-6"
        }`}
      >
        <div className="relative">
          {/* Glow Effect - Reduzido no mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 to-green-400/15 md:from-yellow-400/20 md:to-green-400/20 rounded-xl md:rounded-2xl blur-lg md:blur-xl scale-105 md:scale-110"></div>

          {/* Logo Container - Tamanho responsivo */}
          <div className="relative bg-white/5 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/10">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT_Image_4_07_2025__14_28_44-removebg-preview-C2FjYDMllgQGDzdnB1rRTeA1CNpZiH.png"
              alt="BetDreams"
              width={280}
              height={100}
              className="w-auto h-14 sm:h-16 md:h-20 lg:h-24 object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Loading Section - Otimizado para mobile */}
      <div
        className={`flex flex-col items-center gap-4 md:gap-6 transition-all duration-800 delay-300 ${
          showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {/* Loading Spinner - Tamanho responsivo */}
        <div className="relative">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 animate-spin" />
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm md:blur-md animate-pulse"></div>
        </div>

        {/* Loading Text - Tamanhos responsivos */}
        <div className="text-center px-4">
          <p className="text-white text-base md:text-lg font-medium mb-1 md:mb-2">Carregando BetDreams</p>
          <p className="text-green-200 text-xs md:text-sm opacity-80">Onde seus sonhos se tornam realidade</p>
        </div>

        {/* Progress Bar - Largura responsiva */}
        <div className="w-48 sm:w-56 md:w-64 bg-white/10 rounded-full h-1.5 md:h-2 overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
        </div>

        {/* Progress Percentage - Fonte responsiva */}
        <p className="text-white/70 text-xs md:text-sm font-mono">{Math.round(progress)}%</p>
      </div>

      {/* Bottom Text - Posição e tamanho responsivos */}
      <div
        className={`absolute bottom-4 md:bottom-8 left-4 right-4 text-center transition-all duration-800 delay-700 ${
          showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <p className="text-white/60 text-xs mb-1 md:mb-2">🔒 Jogue com responsabilidade • 18+</p>
        <p className="text-white/40 text-xs">Autorizada a operar no Brasil</p>
      </div>

      {/* Floating Elements - Reduzidos no mobile */}
      <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full animate-ping delay-300"></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-green-400 rounded-full animate-ping delay-700"></div>
      <div className="absolute top-1/3 left-1/5 w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-ping delay-1000"></div>

      {/* Mobile-specific touch indicator */}
      <div className="md:hidden absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-2 text-white/40 text-xs animate-pulse">
          <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-100"></div>
          <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  )
}
