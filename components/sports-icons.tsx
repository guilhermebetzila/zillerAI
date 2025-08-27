"use client"

import { Trophy, Medal, Target, Star, Gamepad2, Zap, Users, Car, Dice1, Crown } from "lucide-react"

const sportsIcons = [
  { name: "Futebol", icon: Trophy },
  { name: "Mundial de Clubes", icon: Medal },
  { name: "Wimbledon", icon: Target },
  { name: "Basquete", icon: Star },
  { name: "Cassino", icon: Dice1 },
  { name: "Futsal", icon: Trophy },
  { name: "E-Sports", icon: Gamepad2 },
  { name: "Fórmula 1", icon: Car },
  { name: "Tênis de Mesa", icon: Target },
  { name: "Loto", icon: Crown },
  { name: "Virtual", icon: Zap },
  { name: "MLB", icon: Star },
  { name: "Vôleibol", icon: Users },
  { name: "Stock Car", icon: Car },
  { name: "Cavalos", icon: Crown },
  { name: "Golfe", icon: Target },
]

export function SportsIcons() {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {sportsIcons.map((sport) => {
          const Icon = sport.icon
          return (
            <button
              key={sport.name}
              className="flex flex-col items-center gap-2 min-w-[80px] p-2 rounded hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <Icon className="h-5 w-5 text-gray-300" />
              </div>
              <span className="text-xs text-gray-300 text-center">{sport.name}</span>
            </button>
          )
        })}
      </div>

      {/* Sub navigation */}
      <div className="flex gap-6 mt-4 text-sm">
        <button className="text-white font-medium border-b-2 border-white pb-1">Mundial de Clubes</button>
        <button className="text-gray-400 hover:text-white">Série B</button>
        <button className="text-gray-400 hover:text-white">Futebol</button>
        <button className="text-gray-400 hover:text-white">Wimbledon</button>
        <button className="text-gray-400 hover:text-white">Wimbledon - Feminino</button>
        <button className="text-gray-400 hover:text-white">E-Sports</button>
        <button className="text-gray-400 hover:text-white">Liga Nacional de Futsal</button>
        <button className="text-gray-400 hover:text-white">NBA</button>
        <button className="text-gray-400 hover:text-white">GP da Grã-Bretanha</button>
        <button className="text-gray-400 hover:text-white">E-basketball</button>
        <button className="text-gray-400 hover:text-white">Transferências - Especiais</button>
        <button className="text-gray-400 hover:text-white">Ao-Vivo</button>
      </div>
    </div>
  )
}
