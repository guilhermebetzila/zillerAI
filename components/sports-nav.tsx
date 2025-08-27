"use client"

import { cn } from "@/lib/utils"

const sportsNav = [
  { id: "football", name: "Futebol" },
  { id: "basketball", name: "Basquete" },
  { id: "tennis", name: "Tênis" },
  { id: "volleyball", name: "Vôlei" },
  { id: "esports", name: "E-Sports" },
]

interface SportsNavProps {
  selectedSport: string
  onSportSelect: (sport: string) => void
}

export function SportsNav({ selectedSport, onSportSelect }: SportsNavProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex gap-2 overflow-x-auto">
        {sportsNav.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSportSelect(sport.id)}
            className={cn(
              "px-4 py-2 rounded-full whitespace-nowrap transition-colors",
              selectedSport === sport.id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            {sport.name}
          </button>
        ))}
      </div>
    </div>
  )
}
