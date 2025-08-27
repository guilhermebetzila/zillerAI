"use client"

import { Target, Star, Dice1, Gamepad2, Car, Users, Crown, Zap } from "lucide-react"
import Image from "next/image"

const sportsIcons = [
  { name: "Futebol", icon: "football", isImage: true },
  { name: "Mundial de Clubes", icon: "mundial", isImage: true },
  { name: "Wimbledon", icon: Target },
  { name: "Basquete", icon: Star },
  { name: "Cassino", icon: Dice1 },
  { name: "Futsal", icon: "football", isImage: true },
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

export function SportsIconsGrid() {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="grid grid-cols-8 gap-3">
        {sportsIcons.map((sport) => {
          return (
            <button
              key={sport.name}
              className="flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                {sport.isImage ? (
                  sport.icon === "football" ? (
                    <Image
                      src="/football-icon.png"
                      alt="Football"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                      unoptimized
                    />
                  ) : sport.icon === "mundial" ? (
                    <Image
                      src="/mundial-clubes-icon.png"
                      alt="Mundial de Clubes"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                      unoptimized
                    />
                  ) : null
                ) : (
                  (() => {
                    const Icon = sport.icon as any
                    return <Icon className="h-4 w-4 text-gray-300" />
                  })()
                )}
              </div>
              <span className="text-xs text-gray-300 text-center leading-tight">{sport.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
