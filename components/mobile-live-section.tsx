"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Users, TrendingUp } from "lucide-react"

const liveMatches = [
  {
    id: "1",
    homeTeam: "Flamengo",
    awayTeam: "Palmeiras",
    score: "2-1",
    time: "78'",
    viewers: 15420,
    odds: { home: 3.2, draw: 2.8, away: 2.1 },
  },
  {
    id: "2",
    homeTeam: "Corinthians",
    awayTeam: "São Paulo",
    score: "0-0",
    time: "45'",
    viewers: 8930,
    odds: { home: 2.5, draw: 3.1, away: 2.9 },
  },
]

const liveStats = [
  { label: "Jogos Ao Vivo", value: "47", icon: Play },
  { label: "Apostadores", value: "12.3K", icon: Users },
  { label: "Odds Médias", value: "2.8x", icon: TrendingUp },
]

export function MobileLiveSection() {
  return (
    <div className="space-y-4">
      {/* Header ao vivo */}
      <div className="px-4">
        <Card className="bg-gradient-to-r from-red-600 to-orange-600 border-0 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" />
                APOSTAS AO VIVO
              </h3>
              <p className="text-xs opacity-90">Acompanhe em tempo real</p>
            </div>
            <div className="text-2xl animate-pulse">🔴</div>
          </div>
        </Card>
      </div>

      {/* Estatísticas rápidas */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          {liveStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="bg-gray-800 border-gray-700 p-3 text-center">
                <Icon className="h-4 w-4 text-green-400 mx-auto mb-1" />
                <div className="text-white font-bold text-sm">{stat.value}</div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Jogos ao vivo */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Jogos em Andamento</h2>
          <Button variant="ghost" size="sm" className="text-green-400 text-xs h-auto p-0">
            Ver todos
          </Button>
        </div>

        <div className="space-y-3">
          {liveMatches.map((match) => (
            <Card key={match.id} className="bg-gray-800 border-gray-700 p-4">
              {/* Header do jogo */}
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                  <Play className="h-2 w-2 mr-1 fill-current" />
                  AO VIVO
                </Badge>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {match.time}
                  <Users className="h-3 w-3" />
                  {(Number(match.viewers) / 1000).toFixed(1)}K
                </div>
              </div>

              {/* Times e placar */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{match.homeTeam}</span>
                  <span className="text-green-400 font-bold text-lg">
                    {match.score.split("-")[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{match.awayTeam}</span>
                  <span className="text-green-400 font-bold text-lg">
                    {match.score.split("-")[1]}
                  </span>
                </div>
              </div>

              {/* Odds ao vivo */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 bg-gray-700 border-gray-600 hover:bg-green-700"
                >
                  <span className="text-xs text-gray-400">1</span>
                  <span className="font-semibold text-white">
                    {Number(match.odds.home).toFixed(2)}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 bg-gray-700 border-gray-600 hover:bg-green-700"
                >
                  <span className="text-xs text-gray-400">X</span>
                  <span className="font-semibold text-white">
                    {Number(match.odds.draw).toFixed(2)}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col h-auto py-2 bg-gray-700 border-gray-600 hover:bg-green-700"
                >
                  <span className="text-xs text-gray-400">2</span>
                  <span className="font-semibold text-white">
                    {Number(match.odds.away).toFixed(2)}
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
