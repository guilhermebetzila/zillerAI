"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { QRCodeGenerator } from "@/components/qr-code-generator"  // Apenas um import do QRCodeGenerator

import {
  User,
  Settings,
  Users,
  Shield,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  Share2,
  QrCode,
  Scan,
  MessageSquare,
  Clock,
  Calendar,
  Phone,
  Download,
  Crown,
  Info,
  Timer,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"

import { QRScanner } from "./qr-scanner"  // Mantém o QRScanner normalmente

interface UserProfile {
  name: string
  email: string
  phone: string
  avatar: string
  balance: number
  level: number
  xp: number
  nextLevelXp: number
  referralCode: string
  referralLink: string
  totalReferred: number
  activeReferred: number
  referralEarnings: number
  joinDate: string
  lastLogin: string
  isVip: boolean
  kycStatus: "pending" | "approved" | "rejected"
  twoFactorEnabled: boolean
}

interface LoginHistory {
  id: string
  date: string
  time: string
  device: string
  location: string
  ip: string
  status: "success" | "failed"
}

interface ReferralHistory {
  id: string
  name: string
  date: string
  status: "pending" | "active" | "inactive"
  earnings: number
  level: number
}

interface TimeoutSettings {
  normalSession: number // em minutos
  rememberMeSession: number // em dias
  autoExtend: boolean
  deviceSpecific: boolean
  maxSecurity: boolean
  customEnabled: boolean
}

export function MobileProfileSection() {
  const [activeTab, setActiveTab] = useState("info")
  const [showBalance, setShowBalance] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showTimeoutSettings, setShowTimeoutSettings] = useState(false)

  // Estados dos dados do usuário
  const [userProfile] = useState<UserProfile>({
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+55 11 99999-9999",
    avatar: "/placeholder.svg?height=80&width=80&text=JS",
    balance: 1250.75,
    level: 8,
    xp: 2340,
    nextLevelXp: 3000,
    referralCode: "JOAO2024",
    referralLink: "https://betdreams.com/ref/JOAO2024",
    totalReferred: 12,
    activeReferred: 8,
    referralEarnings: 450.25,
    joinDate: "15/03/2024",
    lastLogin: "Hoje às 14:30",
    isVip: true,
    kycStatus: "approved",
    twoFactorEnabled: true,
  })

  const [loginHistory] = useState<LoginHistory[]>([
    {
      id: "1",
      date: "05/01/2025",
      time: "14:30",
      device: "iPhone 15 Pro",
      location: "São Paulo, SP",
      ip: "192.168.1.1",
      status: "success",
    },
    {
      id: "2",
      date: "04/01/2025",
      time: "09:15",
      device: "MacBook Pro",
      location: "São Paulo, SP",
      ip: "192.168.1.2",
      status: "success",
    },
    {
      id: "3",
      date: "03/01/2025",
      time: "22:45",
      device: "iPhone 15 Pro",
      location: "Rio de Janeiro, RJ",
      ip: "10.0.0.1",
      status: "success",
    },
    {
      id: "4",
      date: "02/01/2025",
      time: "16:20",
      device: "Samsung Galaxy",
      location: "Desconhecido",
      ip: "203.0.113.1",
      status: "failed",
    },
  ])

  const [referralHistory] = useState<ReferralHistory[]>([
    {
      id: "1",
      name: "Maria Santos",
      date: "02/01/2025",
      status: "active",
      earnings: 50.0,
      level: 3,
    },
    {
      id: "2",
      name: "Pedro Costa",
      date: "28/12/2024",
      status: "active",
      earnings: 75.5,
      level: 5,
    },
    {
      id: "3",
      name: "Ana Lima",
      date: "25/12/2024",
      status: "pending",
      earnings: 0,
      level: 1,
    },
    {
      id: "4",
      name: "Carlos Oliveira",
      date: "20/12/2024",
      status: "inactive",
      earnings: 25.0,
      level: 2,
    },
  ])

  const [timeoutSettings, setTimeoutSettings] = useState<TimeoutSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("session-timeout-settings")
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return {
      normalSession: 30,
      rememberMeSession: 7,
      autoExtend: true,
      deviceSpecific: false,
      maxSecurity: false,
      customEnabled: false,
    }
  })

  // Salvar configurações no localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("session-timeout-settings", JSON.stringify(timeoutSettings))
    }
  }, [timeoutSettings])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Copiado para a área de transferência!")
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const shareReferralLink = async () => {
    const shareData = {
      title: "BetDreams - Cadastre-se e ganhe bônus!",
      text: `Use meu código ${userProfile.referralCode} e ganhe bônus especial no cadastro!`,
      url: userProfile.referralLink,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback para WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `🎰 *BetDreams* - A melhor casa de apostas!\n\n` +
            `Use meu código *${userProfile.referralCode}* e ganhe bônus especial no cadastro!\n\n` +
            `${userProfile.referralLink}\n\n` +
            `#BetDreams #Apostas #Bonus`,
        )}`
        window.open(whatsappUrl, "_blank")
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err)
    }
  }

  const handleQRScanSuccess = (data: string) => {
    console.log("QR Code escaneado:", data)
    // Processar o QR Code escaneado
    if (data.includes("betdreams.com/ref/")) {
      alert("Código de indicação detectado! Redirecionando para cadastro...")
    }
  }

  const updateTimeoutSettings = (updates: Partial<TimeoutSettings>) => {
    setTimeoutSettings((prev) => ({ ...prev, ...updates }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "active":
      case "approved":
        return "text-green-400"
      case "failed":
      case "inactive":
      case "rejected":
        return "text-red-400"
      case "pending":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "active":
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "failed":
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "inactive":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <div className="space-y-4">
            {/* Perfil do Usuário */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={userProfile.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full border-2 border-purple-500"
                    />
                    {userProfile.isVip && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{userProfile.name}</h3>
                      {userProfile.isVip && <Badge className="bg-yellow-500 text-black text-xs">VIP</Badge>}
                    </div>
                    <p className="text-gray-400 text-sm">{userProfile.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-600 text-white text-xs">Nível {userProfile.level}</Badge>
                      <Badge className={`text-xs ${getStatusColor(userProfile.kycStatus)}`}>
                        {userProfile.kycStatus === "approved"
                          ? "Verificado"
                          : userProfile.kycStatus === "pending"
                            ? "Pendente"
                            : "Rejeitado"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Saldo */}
                <div className="bg-gray-900 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Saldo Disponível</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {showBalance ? `R$ ${userProfile.balance.toFixed(2)}` : "R$ ••••••"}
                  </div>
                </div>

                {/* Progresso de Nível */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Progresso do Nível</span>
                    <span className="text-purple-400 text-sm">
                      {userProfile.xp}/{userProfile.nextLevelXp} XP
                    </span>
                  </div>
                  <Progress value={(userProfile.xp / userProfile.nextLevelXp) * 100} className="h-2" />
                </div>

                {/* Informações Pessoais */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">{userProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">Membro desde {userProfile.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">Último acesso: {userProfile.lastLogin}</span>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button
                    onClick={() => setActiveTab("referral")}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ver Programa
                  </Button>
                  <Button
                    onClick={() => {
                      setActiveTab("referral")
                      setShowQRCode(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Ver QR Code
                  </Button>
                </div>
              </div>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gray-800 border-gray-700">
                <div className="p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{userProfile.totalReferred}</div>
                  <div className="text-xs text-gray-400">Indicações</div>
                </div>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <div className="p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">R$ {userProfile.referralEarnings.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Ganhos</div>
                </div>
              </Card>
            </div>
          </div>
        )

      case "referral":
        return (
          <div className="space-y-4">
            {/* Card Principal de Indicação */}
            <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-500">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Programa de Indicação</h3>
                  <Badge className="bg-yellow-500 text-black text-xs">VIP</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{userProfile.totalReferred}</div>
                    <div className="text-xs text-purple-300">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{userProfile.activeReferred}</div>
                    <div className="text-xs text-purple-300">Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-400">
                      R$ {userProfile.referralEarnings.toFixed(2)}
                    </div>
                    <div className="text-xs text-purple-300">Ganhos</div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300 text-sm">Seu Código</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(userProfile.referralCode)}
                      className="text-purple-400 hover:text-white p-1"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">{userProfile.referralCode}</div>
                </div>

                <div className="bg-black/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-300 text-sm">Link de Indicação</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(userProfile.referralLink)}
                      className="text-purple-400 hover:text-white p-1"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-white break-all">{userProfile.referralLink}</div>
                </div>

                {/* Botões de Compartilhamento */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button onClick={shareReferralLink} className="bg-green-600 hover:bg-green-700 text-white text-sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button
                    onClick={() => setShowQRCode(!showQRCode)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    {showQRCode ? "Ocultar QR" : "Mostrar QR"}
                  </Button>
                </div>

                {/* QR Code */}
                {showQRCode && (
                  <Card className="bg-gray-800 border-gray-600 mb-4">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-medium text-sm">QR Code de Indicação</span>
                      </div>
                      <QRCodeGenerator text={userProfile.referralLink} />
                      <p className="text-gray-400 text-xs mt-2 text-center">
                        Compartilhe este QR Code para facilitar o cadastro
                      </p>
                    </div>
                  </Card>
                )}

                {/* Grid de Ações */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                        `🎰 *BetDreams* - A melhor casa de apostas!\n\n` +
                          `Use meu código *${userProfile.referralCode}* e ganhe bônus especial!\n\n` +
                          `${userProfile.referralLink}\n\n` +
                          `#BetDreams #Apostas #Bonus`,
                      )}`
                      window.open(whatsappUrl, "_blank")
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    onClick={() => setShowQRScanner(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm"
                  >
                    <Scan className="h-4 w-4 mr-1" />
                    Escanear QR
                  </Button>
                </div>
              </div>
            </Card>

            {/* Como Funciona */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <h4 className="text-white font-medium mb-3">Como Funciona</h4>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Compartilhe seu código</p>
                      <p className="text-gray-400 text-xs">Envie seu link ou QR Code para amigos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Amigo se cadastra</p>
                      <p className="text-gray-400 text-xs">Usando seu código de indicação</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Vocês ganham bônus</p>
                      <p className="text-gray-400 text-xs">Recompensas para ambos!</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Histórico de Indicações */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <h4 className="text-white font-medium mb-3">Indicações Recentes</h4>
                <div className="space-y-3">
                  {referralHistory.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className={`${getStatusColor(referral.status)}`}>{getStatusIcon(referral.status)}</div>
                        <div>
                          <p className="text-white text-sm font-medium">{referral.name}</p>
                          <p className="text-gray-400 text-xs">{referral.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm font-medium">
                          {referral.earnings > 0 ? `+R$ ${referral.earnings.toFixed(2)}` : "Pendente"}
                        </p>
                        <p className="text-gray-400 text-xs">Nível {referral.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Termos e Condições */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <h4 className="text-white font-medium mb-2">Termos e Condições</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Bônus válido apenas para novos usuários</p>
                  <p>• Indicado deve fazer primeiro depósito</p>
                  <p>• Recompensas creditadas em até 24h</p>
                  <p>• Sujeito aos termos gerais da plataforma</p>
                </div>
              </div>
            </Card>
          </div>
        )

      case "security":
        return (
          <div className="space-y-4">
            {/* Configurações de Segurança */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <h4 className="text-white font-medium mb-4">Configurações de Segurança</h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-white text-sm">Autenticação 2FA</p>
                        <p className="text-gray-400 text-xs">Proteção adicional da conta</p>
                      </div>
                    </div>
                    <Switch checked={userProfile.twoFactorEnabled} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Timer className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-white text-sm">Timeout de Sessão</p>
                        <p className="text-gray-400 text-xs">Configurar tempo de inatividade</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTimeoutSettings(!showTimeoutSettings)}
                      className="border-gray-600 text-gray-300"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {showTimeoutSettings && (
                    <Card className="bg-gray-900 border-gray-600">
                      <div className="p-4">
                        <h5 className="text-white font-medium mb-4">Configurações de Timeout</h5>

                        {/* Configurações Básicas */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="text-gray-300 text-sm mb-2 block">Sessão Normal</label>
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[timeoutSettings.normalSession]}
                                onValueChange={([value]) => updateTimeoutSettings({ normalSession: value })}
                                max={120}
                                min={5}
                                step={5}
                                className="flex-1"
                              />
                              <span className="text-white text-sm w-16">{timeoutSettings.normalSession} min</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-gray-300 text-sm mb-2 block">Sessão "Manter Logado"</label>
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[timeoutSettings.rememberMeSession]}
                                onValueChange={([value]) => updateTimeoutSettings({ rememberMeSession: value })}
                                max={30}
                                min={1}
                                step={1}
                                className="flex-1"
                              />
                              <span className="text-white text-sm w-16">{timeoutSettings.rememberMeSession} dias</span>
                            </div>
                          </div>
                        </div>

                        {/* Configurações Avançadas */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm">Auto-extensão</p>
                              <p className="text-gray-400 text-xs">Estender sessão automaticamente</p>
                            </div>
                            <Switch
                              checked={timeoutSettings.autoExtend}
                              onCheckedChange={(checked) => updateTimeoutSettings({ autoExtend: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm">Timeout por dispositivo</p>
                              <p className="text-gray-400 text-xs">Configurações específicas por device</p>
                            </div>
                            <Switch
                              checked={timeoutSettings.deviceSpecific}
                              onCheckedChange={(checked) => updateTimeoutSettings({ deviceSpecific: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm">Modo Segurança Máxima</p>
                              <p className="text-gray-400 text-xs">Timeout ultra-curto (2 min)</p>
                            </div>
                            <Switch
                              checked={timeoutSettings.maxSecurity}
                              onCheckedChange={(checked) => updateTimeoutSettings({ maxSecurity: checked })}
                            />
                          </div>
                        </div>

                        {/* Indicadores Visuais */}
                        <div className="bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 text-sm">Nível de Segurança</span>
                            <Badge
                              className={`text-xs ${
                                timeoutSettings.maxSecurity
                                  ? "bg-red-600 text-white"
                                  : timeoutSettings.normalSession <= 15
                                    ? "bg-yellow-600 text-white"
                                    : "bg-green-600 text-white"
                              }`}
                            >
                              {timeoutSettings.maxSecurity
                                ? "Máxima"
                                : timeoutSettings.normalSession <= 15
                                  ? "Alta"
                                  : "Normal"}
                            </Badge>
                          </div>
                          <Progress
                            value={
                              timeoutSettings.maxSecurity
                                ? 100
                                : timeoutSettings.normalSession <= 15
                                  ? 75
                                  : timeoutSettings.normalSession <= 30
                                    ? 50
                                    : 25
                            }
                            className="h-2"
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </Card>

            {/* Histórico de Login */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-4">
                <h4 className="text-white font-medium mb-4">Histórico de Login</h4>
                <div className="space-y-3">
                  {loginHistory.map((login) => (
                    <div key={login.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className={`${getStatusColor(login.status)}`}>{getStatusIcon(login.status)}</div>
                        <div>
                          <p className="text-white text-sm">{login.device}</p>
                          <p className="text-gray-400 text-xs">
                            {login.date} às {login.time}
                          </p>
                          <p className="text-gray-500 text-xs">{login.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`text-xs ${
                            login.status === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                          }`}
                        >
                          {login.status === "success" ? "Sucesso" : "Falhou"}
                        </Badge>
                        <p className="text-gray-500 text-xs mt-1">{login.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Ações de Segurança */}
            <div className="grid grid-cols-1 gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Shield className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700">
                <Download className="h-4 w-4 mr-2" />
                Baixar Dados da Conta
              </Button>
              <Button variant="outline" className="border-red-600 text-red-400 bg-transparent hover:bg-red-600/20">
                <LogOut className="h-4 w-4 mr-2" />
                Encerrar Todas as Sessões
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header com Scanner */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-lg font-semibold">Minha Conta</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQRScanner(true)}
            className="text-gray-400 hover:text-white"
          >
            <Scan className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === "info"
                ? "text-purple-400 border-purple-400"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <User className="h-4 w-4 mx-auto mb-1" />
            Informações
          </button>
          <button
            onClick={() => setActiveTab("referral")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === "referral"
                ? "text-purple-400 border-purple-400"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <Users className="h-4 w-4 mx-auto mb-1" />
            Indicar Amigos
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === "security"
                ? "text-purple-400 border-purple-400"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4 mx-auto mb-1" />
            Segurança
          </button>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-4">{renderTabContent()}</div>

      {/* QR Scanner Modal */}
      <QRScanner isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} onScanSuccess={handleQRScanSuccess} />
    </div>
  )
}
