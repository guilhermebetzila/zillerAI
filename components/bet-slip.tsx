"use client"

import { useState } from "react"
import { Card } from "@ui/card"
import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { Badge } from "@ui/badge"
import { X, Trash2 } from "lucide-react"

interface BetSlipProps {
  bets: {
    id: string
    selection: string
    match: string
    odds: number | string
  }[]
  onRemoveBet: (betId: string) => void
}

export function BetSlip({ bets, onRemoveBet }: BetSlipProps) {
  const [stake, setStake] = useState("")

  const totalOdds = bets.reduce((acc, bet) => acc * Number(bet.odds), 1)
  const stakeValue = parseFloat(stake) || 0
  const potentialWin = (stakeValue * totalOdds).toFixed(2)

  if (bets.length === 0) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Cupom de Apostas</h3>
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-sm">Selecione suas apostas para começar</p>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 h-[calc(100vh-80px)] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Cupom de Apostas</h3>
          <Badge variant="secondary">{bets.length}</Badge>
        </div>

        <div className="space-y-3 mb-4">
          {bets.map((bet) => (
            <Card key={bet.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{bet.selection}</p>
                  <p className="text-xs text-gray-600 truncate">{bet.match}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {Number(bet.odds).toFixed(2)}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={() => onRemoveBet(bet.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-gray-50">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total de Odds:</span>
              <span className="font-semibold">{totalOdds.toFixed(2)}</span>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Valor da Aposta (R$)</label>
              <Input
                type="number"
                placeholder="0,00"
                value={stake}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStake(e.target.value.replace(",", "."))
                }
                className="text-center"
              />
            </div>

            <div className="flex justify-between text-sm font-medium">
              <span>Ganho Potencial:</span>
              <span className="text-green-600">R$ {potentialWin}</span>
            </div>
          </div>
        </Card>

        <div className="mt-4 space-y-2">
          <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
            Fazer Aposta
          </Button>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => bets.forEach((bet) => onRemoveBet(bet.id))}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Cupom
          </Button>
        </div>
      </div>
    </aside>
  )
}
