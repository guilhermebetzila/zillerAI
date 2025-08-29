'use client'

import { Card, CardContent } from "@ui/card"
import { Button } from "@ui/button"
import { Badge } from "@ui/badge"
import { Clock, Play } from "lucide-react"
import { cn } from "@lib/utils"

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  status: "live" | "upcoming"
  odds: {
    home: number
    draw: number
    away: number
  }
}

interface Bet {
  id: string
  matchId: string
  type: "home" | "away" | "draw"
  odds: number
  selection: string
  match: string
}

interface MatchListProps {
  selectedSport: string
  onBetSelect: (bet: Bet) => void
  selectedBets: Bet[]
}

const matches: Match[] = [
  {
    id: "1",
    homeTeam: "Flamengo",
    awayTeam: "Palmeiras",
    league: "Brasileirão Série A",
    time: "20:00",
    status: "live",
    odds: { home: 2.1, draw: 3.2, away: 3.5 },
  },
  {
    id: "2",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    league: "La Liga",
    time: "16:00",
    status: "upcoming",
    odds: { home: 1.85, draw: 3.6, away: 4.2 },
  },
  {
    id: "3",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    league: "Premier League",
    time: "14:30",
    status: "upcoming",
    odds: { home: 2.3, draw: 3.1, away: 3.2 },
  },
  {
    id: "4",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    league: "Ligue 1",
    time: "21:45",
    status: "upcoming",
    odds: { home: 1.6, draw: 4.0, away: 5.5 },
  },
]

export function MatchList({ selectedSport, onBetSelect, selectedBets }: MatchListProps) {
  const createBet = (matchId: string, type: "home" | "draw" | "away", odds: number, match: Match): Bet => ({
    id: `${matchId}-${type}`,
    matchId,
    type,
    odds,
    selection: type === "home" ? match.homeTeam : type === "away" ? match.awayTeam : "Empate",
    match: `${match.homeTeam} vs ${match.awayTeam}`,
  })

  const isBetSelected = (matchId: string, type: "home" | "draw" | "away") => {
    return selectedBets.some((bet) => bet.id === `${matchId}-${type}`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        {selectedSport === "live" ? "Jogos Ao Vivo" : "Próximos Jogos"}
      </h2>

      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {match.league}
                </Badge>
                {match.status === "live" && (
                  <Badge className="bg-red-500 hover:bg-red-600 text-white">
                    <Play className="h-3 w-3 mr-1" />
                    AO VIVO
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {match.time}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{match.homeTeam}</span>
                  <span className="text-sm text-gray-500">Casa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{match.awayTeam}</span>
                  <span className="text-sm text-gray-500">Fora</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBetSelect(createBet(match.id, "home", match.odds.home, match))}
                  className={cn(
                    "flex flex-col h-auto py-2",
                    isBetSelected(match.id, "home") && "bg-green-100 border-green-500",
                  )}
                >
                  <span className="text-xs text-gray-600">1</span>
                  <span className="font-semibold">{match.odds.home}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBetSelect(createBet(match.id, "draw", match.odds.draw, match))}
                  className={cn(
                    "flex flex-col h-auto py-2",
                    isBetSelected(match.id, "draw") && "bg-green-100 border-green-500",
                  )}
                >
                  <span className="text-xs text-gray-600">X</span>
                  <span className="font-semibold">{match.odds.draw}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBetSelect(createBet(match.id, "away", match.odds.away, match))}
                  className={cn(
                    "flex flex-col h-auto py-2",
                    isBetSelected(match.id, "away") && "bg-green-100 border-green-500",
                  )}
                >
                  <span className="text-xs text-gray-600">2</span>
                  <span className="font-semibold">{match.odds.away}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
