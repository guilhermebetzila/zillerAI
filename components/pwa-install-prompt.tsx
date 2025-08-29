"use client"

import { useState, useEffect } from "react"

// Componentes UI
import { Button } from "@ui/button"
import { Card } from "@ui/card"

// Ícones
import { Download, X, Smartphone } from "lucide-react"


interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running as PWA
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)

    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after 30 seconds if not dismissed
      setTimeout(() => {
        if (!localStorage.getItem("pwa-prompt-dismissed")) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("PWA installed")
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", "true")
  }

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) return null

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-green-800 border-green-600 text-white z-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Smartphone className="h-6 w-6 text-green-300" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Instalar BetDreams</h3>
          <p className="text-xs text-green-100 mb-3">
            {isIOS
              ? "Adicione à tela inicial para acesso rápido. Toque em 'Compartilhar' e depois 'Adicionar à Tela de Início'."
              : "Instale nosso app para uma experiência mais rápida e notificações."}
          </p>

          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <Button onClick={handleInstall} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                <Download className="h-3 w-3 mr-1" />
                Instalar
              </Button>
            )}

            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="border-green-600 text-green-100 hover:bg-green-700 text-xs bg-transparent"
            >
              Agora não
            </Button>
          </div>
        </div>

        <Button
          onClick={handleDismiss}
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-6 w-6 p-0 text-green-300 hover:text-white hover:bg-green-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
