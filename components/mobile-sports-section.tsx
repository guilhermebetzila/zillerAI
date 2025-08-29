"use client"

import { Card } from "@ui/card"
import { Button } from "@ui/button"
import { Badge } from "@ui/badge"
import { Clock, Play, Star } from "lucide-react"

const featuredMatches = [
  {
    id: "1",
    homeTeam: "Flamengo",
    awayTeam: "Palmeiras",
    league: "Brasileirão",
    time: "20:00",
    status: "live",
    odds: { home: 2.1, draw: 3.2, away: 3.5 },
    featured: true,
  },
  {
    id: "2",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    league: "La Liga",
    time: "16:00",
    status: "upcoming",
    odds: { home: 1.85, draw: 3.6, away: 4.2 },
    featured: true,
  },
]

const quickSports = [
  { name: "Futebol", icon: "⚽", count: 156 },
  { name: "Basquete", icon: "🏀", count: 89 },
  { name: "Tênis", icon: "🎾", count: 45 },
  { name: "E-Sports", icon: "🎮", count: 78 },
]

export function MobileSportsSection() {
  return (
    <div className="space-y-4">
      {/* Banner promocional compacto */}
      <div className="px-4">
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 border-0 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm mb-1">BÔNUS DE BOAS-VINDAS</h3>
              <p className="text-xs opacity-90">Até R$ 500 no primeiro depósito</p>
            </div>
            <Button size="sm" className="bg-yellow-500 text-black hover:bg-yellow-400 text-xs">
              Ativar
            </Button>
          </div>
        </Card>
      </div>

      {/* Esportes rápidos */}
      <div className="px-4">
        <h2 className="text-white font-semibold mb-3 text-sm">Esportes Populares</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickSports.map((sport) => (
            <Card
              key={sport.name}
              className="bg-gray-800 border-gray-700 p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <div className="text-2xl mb-1">{sport.icon}</div>
              <div className="text-white text-xs font-medium mb-1">{sport.name}</div>
              <div className="text-gray-400 text-xs">{sport.count} jogos</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Jogos em destaque */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Jogos em Destaque</h2>
          <Button variant="ghost" size="sm" className="text-green-400 text-xs h-auto p-0">
            Ver todos
          </Button>
        </div>

        <div className="space-y-3">
          {featuredMatches.map((match) => (
            <Card key={match.id} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {match.league}
                  </Badge>
                  {match.status === "live" && (
                    <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                      <Play className="h-2 w-2 mr-1" />
                      AO VIVO
                    </Badge>
                  )}
                  {match.featured && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {match.time}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{match.homeTeam}</span>
                  <span className="text-xs text-gray-500">Casa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{match.awayTeam}</span>
                  <span className="text-xs text-gray-500">Fora</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 bg-gray-700 border-gray-600 hover:bg-green-700"
                >
                  <span className="text-xs text-gray-400">1</span>
                  <span className="font-semibold text-white">{match.odds.home}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 bg-gray-700 border-gray-600 hover:bg-green-700"
                >
                  <span className="text-xs text-gray-400">X</span>
                  <span className="font-semibold text-white">{match.odds.draw}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 bg-gray-700 border-gray-600 hover:bg-green-700"
                >
                  <span className="text-xs text-gray-400">2</span>
                  <span className="font-semibold text-white">{match.odds.away}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
