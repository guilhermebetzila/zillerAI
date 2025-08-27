"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

const matches = [
  {
    id: "1",
    type: "SUPER APOSTA AUMENTADA",
    multiplier: "4x",
    odds: "13.5 mil fichas",
    player: "Vinícius Jr.",
    match: "Real Madrid v Borussia Dortmund",
    markets: ["Vinícius Jr. - Para Marcar", "Vinícius Jr. - Para Dar Assistência", "Para Real Madrid se Qualificar"],
    finalOdds: "2.00",
    originalOdds: "1.61",
    color: "yellow",
  },
  {
    id: "2",
    type: "APOSTA AUMENTADA",
    match: "Real Madrid v Borussia Dortmund",
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
    match: "Real Madrid v Borussia Dortmund",
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
    match: "Real Madrid v Borussia Dortmund",
    markets: ["Maior Número de Chutes a Gol", "Maior Número de Escanteios", "Ambos Marcam: Final Real Madrid"],
    finalOdds: "5.00",
    color: "blue",
  },
]

export function WorldCupSection() {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Image
            src="/mundial-clubes-icon.png"
            alt="Mundial de Clubes"
            width={20}
            height={20}
            className="w-5 h-5 object-contain"
            unoptimized
          />
          MUNDIAL DE CLUBES
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 bg-transparent text-xs hover:bg-gray-700"
        >
          Ver Mais
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {matches.map((match) => (
          <Card key={match.id} className="bg-gray-800 border-gray-700 p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      match.color === "yellow"
                        ? "bg-yellow-500 text-black"
                        : match.color === "green"
                          ? "bg-green-600 text-white"
                          : "bg-cyan-600 text-white"
                    }`}
                  >
                    {match.type}
                  </span>
                  {match.multiplier && <span className="text-yellow-400 font-bold text-sm">{match.multiplier}</span>}
                  {match.odds && <span className="text-gray-400 text-xs">{match.odds}</span>}
                </div>

                <div className="mb-2">
                  {match.player && <div className="text-white font-medium text-sm mb-1">{match.player}</div>}
                  <div className="text-white font-medium text-sm">{match.match}</div>
                </div>

                <div className="space-y-1 mb-2">
                  {match.markets.map((market, index) => (
                    <div key={index} className="text-xs text-gray-300 flex items-center gap-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      {market}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right ml-3">
                <div className="text-xl font-bold text-white mb-1">{match.finalOdds}</div>
                {match.originalOdds && <div className="text-xs text-gray-400 line-through">{match.originalOdds}</div>}
                <Button size="sm" className="mt-1 bg-green-600 hover:bg-green-700 h-6 w-6 p-0">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
