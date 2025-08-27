"use client"

import { cn } from "@/lib/utils"
import { DollarSign, TrendingUp, Target, Gamepad2, Star, Users, Zap, Flame } from "lucide-react"
import Image from "next/image"

const sportsMenu = [
  { id: "ofertas", name: "Ofertas/Funções", icon: DollarSign, highlight: true },
  { id: "em-alta", name: "EM ALTA", icon: TrendingUp, category: true },
  { id: "serie-b", name: "Série B", icon: "football", isImage: true },
  { id: "mundial-clubes", name: "Mundial de Clubes", icon: "mundial", isImage: true },
  { id: "futebol-fim-semana", name: "Futebol - Fim de Semana", icon: "football", isImage: true },
  { id: "lol-msi", name: "LOL - MSI", icon: Gamepad2 },
  { id: "nba-verao", name: "NBA - Liga de Verão", icon: Star },
  { id: "wimbledon", name: "Wimbledon", icon: Target },
  { id: "wimbledon-feminino", name: "Wimbledon - Feminino", icon: Target },
  { id: "crash", name: "Crash", icon: Zap },
  { id: "lnf", name: "LNF", icon: Users },
  { id: "e-soccer", name: "E-soccer", icon: Gamepad2 },
  { id: "az", name: "A-Z", icon: Flame, category: true },
  { id: "atletismo", name: "Atletismo", icon: Target },
  { id: "badminton", name: "Badminton", icon: Target },
]

interface SportsSidebarProps {
  selectedSport: string
  onSportSelect: (sport: string) => void
}

export function SportsSidebar({ selectedSport, onSportSelect }: SportsSidebarProps) {
  const getIconSrc = (iconType: string) => {
    switch (iconType) {
      case "football":
        return "/football-icon.png"
      case "mundial":
        return "/mundial-clubes-icon.png"
      default:
        return "/football-icon.png"
    }
  }

  return (
    <aside className="w-56 bg-gray-800 border-r border-gray-700 h-[calc(100vh-120px)] overflow-y-auto">
      <div className="p-3">
        {sportsMenu.map((item) => {
          if (item.category) {
            const Icon = item.icon as any
            return (
              <div key={item.id} className="mt-4 mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase">
                  <Icon className="h-3 w-3" />
                  {item.name}
                </div>
              </div>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => onSportSelect(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-left rounded text-sm transition-colors mb-0.5",
                selectedSport === item.id
                  ? "bg-green-700 text-white"
                  : item.highlight
                    ? "text-yellow-400 hover:bg-gray-700"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              {item.isImage ? (
                item.icon === "football" ? (
                  <Image
                    src="/football-icon.png"
                    alt="Football"
                    width={12}
                    height={12}
                    className="w-3 h-3 object-contain flex-shrink-0"
                    unoptimized
                  />
                ) : item.icon === "mundial" ? (
                  <Image
                    src="/mundial-clubes-icon.png"
                    alt="Mundial de Clubes"
                    width={12}
                    height={12}
                    className="w-3 h-3 object-contain flex-shrink-0"
                    unoptimized
                  />
                ) : null
              ) : (
                (() => {
                  const Icon = item.icon as any
                  return <Icon className="h-3 w-3 flex-shrink-0" />
                })()
              )}
              <span className="truncate">{item.name}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
