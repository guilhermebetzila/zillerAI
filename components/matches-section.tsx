"use client"

import { Button } from "@ui/button"
import { Card } from "@ui/card"
import { ArrowRight, Trophy } from "lucide-react"

interface Match {
  id: string
  type: string
  multiplier?: string
  odds?: string
  team1: string
  team2?: string
  markets: string[]
  finalOdds: string
  originalOdds?: string
  color: "yellow" | "green" | "blue"
}

const matches: Match[] = [
  {
    id: "1",
    type: "SUPER APOSTA AUMENTADA",
    multiplier: "4x",
    odds: "13.5 mil fichas",
    team1: "Vinícius Jr.",
    team2: "Real Madrid v Borussia Dortmund",
    markets: [
      "Vinícius Jr. - Para Marcar",
      "Vinícius Jr. - Para Dar Assistência",
      "Para Real Madrid se Qualificar",
    ],
    finalOdds: "2.00",
    color: "yellow",
  },
  {
    id: "2",
    type: "APOSTA AUMENTADA",
    team1: "Real Madrid v Borussia Dortmund",
    markets: [
      "Real Madrid - Mais de 3 Escanteios",
      "Borussia Dortmund - Mais de 3 Escanteios",
      "Para Ambos os Times Marcarem",
      "Para Ambos os Times Receberem Cartão Amarelo",
    ],
    finalOdds: "10.00",
    originalOdds: "9.00",
    color: "green",
  },
  {
    id: "3",
    type: "APOSTA AUMENTADA",
    team1: "Real Madrid v Borussia Dortmund",
    markets: [
      "Real Madrid - Mais de 3 Escanteios",
      "Borussia Dortmund - Mais de 3 Escanteios",
      "Para Ambos os Times Marcarem",
      "Para Ambos os Times Receberem Cartão",
    ],
    finalOdds: "8.50",
    originalOdds: "7.50",
    color: "green",
  },
  {
    id: "4",
    type: "APOSTA AUMENTADA",
    odds: "6.7 mil fichas",
    team1: "Real Madrid v Borussia Dortmund",
    markets: [
      "Maior Número de Chutes a Gol",
      "Maior Número de Escanteios",
      "Ambos Marcam: Final Real Madrid",
    ],
    finalOdds: "5.00",
    color: "blue",
  },
]

interface MatchesSectionProps {
  selectedSport: string
}

export function MatchesSection({ selectedSport }: MatchesSectionProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          MUNDIAL DE CLUBES
        </h2>
        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 bg-transparent">
          Ver Mais
        </Button>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id} className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      match.color === "yellow"
                        ? "bg-yellow-500 text-black"
                        : match.color === "green"
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {match.type}
                  </span>
                  {match.multiplier && <span className="text-yellow-400 font-bold">{match.multiplier}</span>}
                  {match.odds && <span className="text-gray-400 text-sm">{match.odds}</span>}
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{match.team1}</span>
                    {match.team2 && <span className="text-gray-400">vs</span>}
                  </div>
                  {match.team2 && <div className="text-white font-medium">{match.team2}</div>}
                </div>

                <div className="space-y-1 mb-3">
                  {match.markets.map((market, index) => (
                    <div key={index} className="text-sm text-gray-300 flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      {market}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-1">{match.finalOdds}</div>
                {match.originalOdds && <div className="text-sm text-gray-400 line-through">{match.originalOdds}</div>}
                <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
