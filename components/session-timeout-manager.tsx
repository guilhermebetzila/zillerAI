"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, LogOut, RotateCcw } from "lucide-react"

interface TimeoutConfig {
  normalTimeout: number
  rememberTimeout: number
  warningTime: number
  enableAutoExtend: boolean
  maxExtensions: number
  deviceSpecific: boolean
  mobileTimeout: number
  desktopTimeout: number
  tabletTimeout: number
  securityMode: boolean
  securityTimeout: number
}

const defaultConfig: TimeoutConfig = {
  normalTimeout: 15,
  rememberTimeout: 60,
  warningTime: 5,
  enableAutoExtend: true,
  maxExtensions: 3,
  deviceSpecific: false,
  mobileTimeout: 15,
  desktopTimeout: 30,
  tabletTimeout: 20,
  securityMode: false,
  securityTimeout: 5,
}

interface SessionTimeoutManagerProps {
  isLoggedIn: boolean
  isRemembered: boolean
  onLogout: () => void
  onExtendSession: () => void
}

export function SessionTimeoutManager({
  isLoggedIn,
  isRemembered,
  onLogout,
  onExtendSession,
}: SessionTimeoutManagerProps) {
  const [config, setConfig] = useState<TimeoutConfig>(defaultConfig)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [extensionsUsed, setExtensionsUsed] = useState(0)
  const [isActive, setIsActive] = useState(true)

  // Carregar configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem("timeout-config")
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      }
    }
  }, [])

  // Detectar tipo de dispositivo
  const getDeviceType = () => {
    const width = window.innerWidth
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
  }

  // Calcular timeout baseado nas configurações
  const getTimeoutDuration = useCallback(() => {
    if (config.securityMode) {
      return config.securityTimeout * 60 * 1000 // Converter para ms
    }

    if (config.deviceSpecific) {
      const deviceType = getDeviceType()
      switch (deviceType) {
        case "mobile":
          return config.mobileTimeout * 60 * 1000
        case "tablet":
          return config.tabletTimeout * 60 * 1000
        case "desktop":
          return config.desktopTimeout * 60 * 1000
        default:
          return config.normalTimeout * 60 * 1000
      }
    }

    return isRemembered ? config.rememberTimeout * 60 * 1000 : config.normalTimeout * 60 * 1000
  }, [config, isRemembered])

  // Resetar timer quando usuário faz login
  useEffect(() => {
    if (isLoggedIn) {
      const duration = getTimeoutDuration()
      setTimeLeft(duration)
      setExtensionsUsed(0)
      setShowWarning(false)
    }
  }, [isLoggedIn, getTimeoutDuration])

  // Timer principal
  useEffect(() => {
    if (!isLoggedIn || !isActive) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000
        const warningThreshold = config.warningTime * 60 * 1000

        if (newTime <= warningThreshold && newTime > 0) {
          setShowWarning(true)
        }

        if (newTime <= 0) {
          onLogout()
          setShowWarning(false)
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoggedIn, isActive, config.warningTime, onLogout])

  // Detectar atividade do usuário
  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const resetTimer = () => {
      if (isLoggedIn) {
        const duration = getTimeoutDuration()
        setTimeLeft(duration)
        setShowWarning(false)
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true)
      })
    }
  }, [isLoggedIn, getTimeoutDuration])

  // Estender sessão
  const handleExtendSession = () => {
    if (config.enableAutoExtend && !config.securityMode) {
      const maxExt = config.maxExtensions
      if (maxExt === 0 || extensionsUsed < maxExt) {
        const duration = getTimeoutDuration()
        setTimeLeft(duration)
        setExtensionsUsed((prev) => prev + 1)
        setShowWarning(false)
        onExtendSession()
      }
    }
  }

  // Formatar tempo restante
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // Calcular progresso
  const totalDuration = getTimeoutDuration()
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100

  const canExtend =
    config.enableAutoExtend &&
    !config.securityMode &&
    (config.maxExtensions === 0 || extensionsUsed < config.maxExtensions)

  if (!isLoggedIn || !showWarning) return null

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Sessão Expirando
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{formatTime(timeLeft)}</div>
            <p className="text-gray-300 text-sm">Sua sessão expirará em breve</p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Início</span>
              <span>Logout automático</span>
            </div>
          </div>

          {config.enableAutoExtend && !config.securityMode && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">Extensões usadas:</span>
                <span className="text-white">
                  {extensionsUsed}/{config.maxExtensions === 0 ? "∞" : config.maxExtensions}
                </span>
              </div>
            </div>
          )}

          {config.securityMode && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm font-medium">Modo Segurança Ativo</span>
              </div>
              <p className="text-red-200 text-xs mt-1">Extensão de sessão desabilitada por segurança</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair Agora
            </Button>

            {canExtend && (
              <Button onClick={handleExtendSession} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <RotateCcw className="h-4 w-4 mr-2" />
                Estender
              </Button>
            )}
          </div>

          {!canExtend && config.enableAutoExtend && !config.securityMode && (
            <p className="text-center text-gray-400 text-xs">Limite de extensões atingido</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
