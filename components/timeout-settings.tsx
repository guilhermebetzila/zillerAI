"use client"

import { useState, useEffect } from "react"
import { Card } from "@ui/card"
import { Button } from "@ui/button"
import { Badge } from "@ui/badge"
import { Label } from "@ui/label"
import { Switch } from "@ui/switch"
import { Slider } from "@ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog"
import {
  Clock,
  Shield,
  Smartphone,
  Monitor,
  Tablet,
  AlertTriangle,
  Settings,
  RotateCcw,
  Save,
  Info,
} from "lucide-react"

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

const presetOptions = [
  { value: 5, label: "5 minutos", description: "Máxima segurança", security: "Máxima" },
  { value: 15, label: "15 minutos", description: "Padrão recomendado", security: "Alta" },
  { value: 30, label: "30 minutos", description: "Uso moderado", security: "Média" },
  { value: 60, label: "60 minutos", description: "Sessão longa", security: "Baixa" },
  { value: 120, label: "120 minutos", description: "Máximo permitido", security: "Mínima" },
]

const getSecurityLevel = (minutes: number) => {
  if (minutes <= 5) return { level: "Máxima", color: "text-green-400", bg: "bg-green-900/30" }
  if (minutes <= 15) return { level: "Alta", color: "text-blue-400", bg: "bg-blue-900/30" }
  if (minutes <= 30) return { level: "Média", color: "text-yellow-400", bg: "bg-yellow-900/30" }
  if (minutes <= 60) return { level: "Baixa", color: "text-orange-400", bg: "bg-orange-900/30" }
  return { level: "Mínima", color: "text-red-400", bg: "bg-red-900/30" }
}

interface TimeoutSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: TimeoutConfig) => void
}

export function TimeoutSettings({ isOpen, onClose, onSave }: TimeoutSettingsProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [config, setConfig] = useState<TimeoutConfig>(defaultConfig)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("timeout-config")
    if (saved) {
      try {
        setConfig(JSON.parse(saved))
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
      }
    }
  }, [isOpen])

  const updateConfig = (updates: Partial<TimeoutConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const handleSave = () => {
    localStorage.setItem("timeout-config", JSON.stringify(config))
    onSave(config)
    setHasChanges(false)
  }

  const handleReset = () => {
    setConfig(defaultConfig)
    setHasChanges(true)
  }

  const tabs = [
    { id: "basic", label: "Básico", icon: Clock },
    { id: "advanced", label: "Avançado", icon: Settings },
    { id: "security", label: "Segurança", icon: Shield },
  ]

  const normalSecurity = getSecurityLevel(config.normalTimeout)
  const rememberSecurity = getSecurityLevel(config.rememberTimeout)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-400" />
            Configurar Timeout
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-xs transition-colors ${
                  activeTab === tab.id ? "bg-green-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <Icon className="h-3 w-3" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Aba Básico */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            {/* Sessão Normal */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white font-medium">Sessão Normal</Label>
                <Badge className={`${normalSecurity.bg} ${normalSecurity.color} border-0`}>
                  {normalSecurity.level}
                </Badge>
              </div>
              <p className="text-gray-400 text-xs mb-4">Timeout para login sem "Manter logado"</p>

              <div className="space-y-4">
                <Select
                  value={config.normalTimeout.toString()}
                  onValueChange={(value: string) => updateConfig({ normalTimeout: Number.parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {presetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="text-white">
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <Badge className="ml-2 text-xs bg-gray-700">{option.security}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Personalizar: {config.normalTimeout} min</Label>
                  <Slider
                    value={[config.normalTimeout]}
                    onValueChange={([value]: number[]) => updateConfig({ normalTimeout: value })}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Login Lembrado */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white font-medium">Login Lembrado</Label>
                <Badge className={`${rememberSecurity.bg} ${rememberSecurity.color} border-0`}>
                  {rememberSecurity.level}
                </Badge>
              </div>
              <p className="text-gray-400 text-xs mb-4">Timeout estendido para sessões salvas</p>

              <div className="space-y-4">
                <Select
                  value={config.rememberTimeout.toString()}
                  onValueChange={(value: string) => updateConfig({ rememberTimeout: Number.parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {presetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="text-white">
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <Badge className="ml-2 text-xs bg-gray-700">{option.security}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">Personalizar: {config.rememberTimeout} min</Label>
                  <Slider
                    value={[config.rememberTimeout]}
                    onValueChange={([value]: number[]) => updateConfig({ rememberTimeout: value })}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Tempo de Aviso */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <Label className="text-white font-medium mb-3 block">Tempo de Aviso</Label>
              <p className="text-gray-400 text-xs mb-4">Aviso antes do logout automático</p>

              <div>
                <Label className="text-gray-300 text-sm mb-2 block">
                  Avisar {config.warningTime} minutos antes (
                  {Math.round((config.warningTime / config.normalTimeout) * 100)}% do tempo total)
                </Label>
                <Slider
                  value={[config.warningTime]}
                  onValueChange={([value]: number[]) => updateConfig({ warningTime: value })}
                  max={Math.min(10, Math.floor(config.normalTimeout / 2))}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Aba Avançado */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            {/* Auto-extensão */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white font-medium">Auto-extensão</Label>
                <Switch
                  checked={config.enableAutoExtend}
                  onCheckedChange={(checked: boolean) => updateConfig({ enableAutoExtend: checked })}
                />
              </div>
              <p className="text-gray-400 text-xs mb-4">Permitir extensão automática da sessão</p>

              {config.enableAutoExtend && (
                <div>
                  <Label className="text-gray-300 text-sm mb-2 block">
                    Máximo de extensões: {config.maxExtensions === 0 ? "Ilimitado" : config.maxExtensions}
                  </Label>
                  <Slider
                    value={[config.maxExtensions]}
                    onValueChange={([value]: number[]) => updateConfig({ maxExtensions: value })}
                    max={5}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Ilimitado</span>
                    <span>5 máx</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Configuração por Dispositivo */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white font-medium">Timeout por Dispositivo</Label>
                <Switch
                  checked={config.deviceSpecific}
                  onCheckedChange={(checked: boolean) => updateConfig({ deviceSpecific: checked })}
                />
              </div>
              <p className="text-gray-400 text-xs mb-4">Configurações específicas por tipo de dispositivo</p>

              {config.deviceSpecific && (
                <div className="space-y-4">
                  {/* Mobile */}
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-blue-400" />
                    <div className="flex-1">
                      <Label className="text-gray-300 text-sm">Mobile: {config.mobileTimeout} min</Label>
                      <Slider
                        value={[config.mobileTimeout]}
                        onValueChange={([value]: number[]) => updateConfig({ mobileTimeout: value })}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-green-400" />
                    <div className="flex-1">
                      <Label className="text-gray-300 text-sm">Desktop: {config.desktopTimeout} min</Label>
                      <Slider
                        value={[config.desktopTimeout]}
                        onValueChange={([value]: number[]) => updateConfig({ desktopTimeout: value })}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>

                  {/* Tablet */}
                  <div className="flex items-center gap-3">
                    <Tablet className="h-4 w-4 text-purple-400" />
                    <div className="flex-1">
                      <Label className="text-gray-300 text-sm">Tablet: {config.tabletTimeout} min</Label>
                      <Slider
                        value={[config.tabletTimeout]}
                        onValueChange={([value]: number[]) => updateConfig({ tabletTimeout: value })}
                        max={120}
                        min={5}
                        step={5}
                        className="w-full mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Aba Segurança */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Modo Segurança Máxima */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-400" />
                  Modo Segurança Máxima
                </Label>
                <Switch
                  checked={config.securityMode}
                  onCheckedChange={(checked: boolean) => updateConfig({ securityMode: checked })}
                />
              </div>
              <p className="text-gray-400 text-xs mb-4">
                Timeout ultra-curto para dispositivos públicos ou compartilhados
              </p>

              {config.securityMode && (
                <>
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-300 text-xs font-medium">Atenção</span>
                    </div>
                    <p className="text-red-200 text-xs">
                      Este modo sobrescreve todas as outras configurações e força logout frequente.
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">
                      Timeout de segurança: {config.securityTimeout} min
                    </Label>
                    <Slider
                      value={[config.securityTimeout]}
                      onValueChange={([value]: number[]) => updateConfig({ securityTimeout: value })}
                      max={10}
                      min={2}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>2 min</span>
                      <span>10 min</span>
                    </div>
                  </div>
                </>
              )}
            </Card>

            {/* Resumo de Segurança */}
            <Card className="bg-gray-800 border-gray-700 p-4">
              <Label className="text-white font-medium mb-3 block flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-400" />
                Resumo das Configurações
              </Label>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Sessão Normal</span>
                  <Badge className={`${normalSecurity.bg} ${normalSecurity.color} border-0 text-xs`}>
                    {config.securityMode ? `${config.securityTimeout}min` : `${config.normalTimeout}min`}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Login Lembrado</span>
                  <Badge className={`${rememberSecurity.bg} ${rememberSecurity.color} border-0 text-xs`}>
                    {config.securityMode ? `${config.securityTimeout}min` : `${config.rememberTimeout}min`}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Auto-extensão</span>
                  <Badge
                    className={`${
                      config.enableAutoExtend && !config.securityMode ? "bg-green-900/30 text-green-400" : "bg-gray-700 text-gray-400"
                    } border-0 text-xs`}
                  >
                    {config.enableAutoExtend && !config.securityMode ? "Ativa" : "Inativa"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Modo Segurança</span>
                  <Badge
                    className={`${config.securityMode ? "bg-red-900/30 text-red-400" : "bg-gray-700 text-gray-400"} border-0 text-xs`}
                  >
                    {config.securityMode ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>

        {hasChanges && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300 text-xs">Você tem alterações não salvas</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
