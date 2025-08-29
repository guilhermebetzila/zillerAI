"use client";

import { useState, useEffect } from "react";
import { Card } from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import {
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  LogOut,
  Eye,
} from "lucide-react";
interface LoginRecord {
  id: string
  timestamp: Date
  device: {
    type: "desktop" | "mobile" | "tablet"
    name: string
    browser: string
    os: string
  }
  location: {
    city: string
    country: string
    ip: string
  }
  status: "active" | "expired" | "terminated"
  isCurrentSession: boolean
  isSuspicious: boolean
  userAgent: string
}

interface LoginHistoryProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginHistory({ isOpen, onClose }: LoginHistoryProps) {
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([])
  const [filteredHistory, setFilteredHistory] = useState<LoginRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<LoginRecord | null>(null)

  // Simular dados de histórico de login
  useEffect(() => {
    const generateLoginHistory = (): LoginRecord[] => {
      const devices = [
        {
          type: "mobile" as const,
          name: "iPhone 15 Pro",
          browser: "Safari 17.0",
          os: "iOS 17.1",
        },
        {
          type: "desktop" as const,
          name: "MacBook Pro",
          browser: "Chrome 120.0",
          os: "macOS 14.1",
        },
        {
          type: "mobile" as const,
          name: "Samsung Galaxy S24",
          browser: "Chrome Mobile 120.0",
          os: "Android 14",
        },
        {
          type: "desktop" as const,
          name: "Windows PC",
          browser: "Edge 120.0",
          os: "Windows 11",
        },
        {
          type: "tablet" as const,
          name: "iPad Air",
          browser: "Safari 17.0",
          os: "iPadOS 17.1",
        },
      ]

      const locations = [
        { city: "São Paulo", country: "Brasil", ip: "189.123.45.67" },
        { city: "Rio de Janeiro", country: "Brasil", ip: "201.87.123.45" },
        { city: "Belo Horizonte", country: "Brasil", ip: "177.45.89.123" },
        { city: "Brasília", country: "Brasil", ip: "164.78.123.89" },
        { city: "Salvador", country: "Brasil", ip: "191.234.56.78" },
      ]

      const history: LoginRecord[] = []
      const now = new Date()

      // Sessão atual (sempre primeira)
      history.push({
        id: "current",
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 min atrás
        device: devices[0],
        location: locations[0],
        status: "active",
        isCurrentSession: true,
        isSuspicious: false,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15",
      })

      // Gerar histórico dos últimos 30 dias
      for (let i = 1; i < 25; i++) {
        const daysAgo = Math.floor(Math.random() * 30)
        const hoursAgo = Math.floor(Math.random() * 24)
        const minutesAgo = Math.floor(Math.random() * 60)

        const timestamp = new Date(
          now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000 - minutesAgo * 60 * 1000,
        )
        const device = devices[Math.floor(Math.random() * devices.length)]
        const location = locations[Math.floor(Math.random() * locations.length)]

        // Determinar status baseado na idade
        let status: "active" | "expired" | "terminated"
        if (daysAgo === 0 && hoursAgo < 2) {
          status = Math.random() > 0.3 ? "active" : "expired"
        } else if (daysAgo < 7) {
          status = Math.random() > 0.7 ? "active" : "expired"
        } else {
          status = "expired"
        }

        // Alguns logins terminados manualmente
        if (Math.random() > 0.8) {
          status = "terminated"
        }

        // Detectar logins suspeitos (localização diferente + dispositivo novo)
        const isSuspicious = Math.random() > 0.9 && location.city !== "São Paulo"

        history.push({
          id: `login_${i}`,
          timestamp,
          device,
          location,
          status,
          isCurrentSession: false,
          isSuspicious,
          userAgent: `Mozilla/5.0 (${device.os}) ${device.browser}`,
        })
      }

      return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    setLoginHistory(generateLoginHistory())
  }, [])

  // Filtrar histórico
  useEffect(() => {
    let filtered = loginHistory

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.device.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.location.ip.includes(searchTerm),
      )
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter)
    }

    // Filtro por dispositivo
    if (deviceFilter !== "all") {
      filtered = filtered.filter((record) => record.device.type === deviceFilter)
    }

    setFilteredHistory(filtered)
  }, [loginHistory, searchTerm, statusFilter, deviceFilter])

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      default:
        return Monitor
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "expired":
        return "bg-gray-500"
      case "terminated":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa"
      case "expired":
        return "Expirada"
      case "terminated":
        return "Encerrada"
      default:
        return "Desconhecido"
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes} min atrás`
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours}h atrás`
    } else if (diffInHours < 48) {
      return "Ontem"
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const handleTerminateSession = (recordId: string) => {
    setLoginHistory((prev) =>
      prev.map((record) => (record.id === recordId ? { ...record, status: "terminated" as const } : record)),
    )
  }

  const getActiveSessionsCount = () => {
    return loginHistory.filter((record) => record.status === "active").length
  }

  const getSuspiciousLoginsCount = () => {
    return loginHistory.filter((record) => record.isSuspicious).length
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Histórico de Acessos</h1>
            <p className="text-gray-400 text-sm">Monitore a segurança da sua conta</p>
          </div>
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
            Fechar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{getActiveSessionsCount()}</div>
                <div className="text-sm text-gray-400">Sessões Ativas</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{loginHistory.length}</div>
                <div className="text-sm text-gray-400">Total de Acessos</div>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{getSuspiciousLoginsCount()}</div>
                <div className="text-sm text-gray-400">Acessos Suspeitos</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-gray-800 border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por dispositivo, localização ou IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">
                  Todos
                </SelectItem>
                <SelectItem value="active" className="text-white">
                  Ativas
                </SelectItem>
                <SelectItem value="expired" className="text-white">
                  Expiradas
                </SelectItem>
                <SelectItem value="terminated" className="text-white">
                  Encerradas
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-full md:w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Dispositivo" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">
                  Todos
                </SelectItem>
                <SelectItem value="mobile" className="text-white">
                  Mobile
                </SelectItem>
                <SelectItem value="desktop" className="text-white">
                  Desktop
                </SelectItem>
                <SelectItem value="tablet" className="text-white">
                  Tablet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Lista de Acessos */}
        <div className="space-y-3">
          {filteredHistory.map((record) => {
            const DeviceIcon = getDeviceIcon(record.device.type)
            return (
              <Card
                key={record.id}
                className={`bg-gray-800 border-gray-700 p-4 ${
                  record.isCurrentSession ? "ring-2 ring-green-500" : ""
                } ${record.isSuspicious ? "border-red-500" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Ícone do dispositivo */}
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <DeviceIcon className="h-5 w-5 text-gray-300" />
                    </div>

                    {/* Informações principais */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-medium">{record.device.name}</h3>
                        {record.isCurrentSession && (
                          <Badge className="bg-green-600 text-white text-xs">Sessão Atual</Badge>
                        )}
                        {record.isSuspicious && (
                          <Badge className="bg-red-600 text-white text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Suspeito
                          </Badge>
                        )}
                        <Badge className={`${getStatusColor(record.status)} text-white text-xs`}>
                          {getStatusText(record.status)}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-3 w-3" />
                          <span>
                            {record.device.browser} • {record.device.os}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {record.location.city}, {record.location.country} • {record.location.ip}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(record.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                      className="text-gray-400 hover:text-white h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {record.status === "active" && !record.isCurrentSession && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTerminateSession(record.id)}
                        className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                        title="Encerrar sessão"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Alerta para logins suspeitos */}
                {record.isSuspicious && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                      <div>
                        <p className="text-red-300 text-sm font-medium">Login Suspeito Detectado</p>
                        <p className="text-red-200 text-xs mt-1">
                          Este acesso foi feito de uma localização ou dispositivo não usual. Se não foi você, altere sua
                          senha imediatamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredHistory.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-white font-medium mb-2">Nenhum acesso encontrado</h3>
            <p className="text-gray-400 text-sm">Tente ajustar os filtros de busca</p>
          </Card>
        )}

        {/* Ações em massa */}
        <Card className="bg-gray-800 border-gray-700 p-4 mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Mostrando {filteredHistory.length} de {loginHistory.length} acessos
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                onClick={() => {
                  const activeSessions = loginHistory.filter(
                    (record) => record.status === "active" && !record.isCurrentSession,
                  )
                  activeSessions.forEach((session) => handleTerminateSession(session.id))
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Encerrar Todas as Sessões
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de detalhes */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Detalhes do Acesso</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Dispositivo</label>
                <p className="text-white">{selectedRecord.device.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Navegador</label>
                <p className="text-white">{selectedRecord.device.browser}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Sistema Operacional</label>
                <p className="text-white">{selectedRecord.device.os}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Localização</label>
                <p className="text-white">
                  {selectedRecord.location.city}, {selectedRecord.location.country}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Endereço IP</label>
                <p className="text-white font-mono">{selectedRecord.location.ip}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Data e Hora</label>
                <p className="text-white">
                  {selectedRecord.timestamp.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">User Agent</label>
                <p className="text-white text-xs break-all bg-gray-700 p-2 rounded">{selectedRecord.userAgent}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">Status</label>
                <Badge className={`${getStatusColor(selectedRecord.status)} text-white`}>
                  {getStatusText(selectedRecord.status)}
                </Badge>
              </div>
            </div>

            {selectedRecord.status === "active" && !selectedRecord.isCurrentSession && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <Button
                  onClick={() => {
                    handleTerminateSession(selectedRecord.id)
                    setSelectedRecord(null)
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Encerrar Esta Sessão
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
