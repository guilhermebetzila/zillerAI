"use client"

import { SportsSidebar } from "@/components/sports-sidebar"
import { MainContent } from "@/components/main-content"

interface LayoutProps {
  selectedSport: string
  onSportSelect: (sport: string) => void
}

export function Layout({ selectedSport, onSportSelect }: LayoutProps) {
  return (
    <div className="flex max-w-7xl mx-auto">
      <SportsSidebar selectedSport={selectedSport} onSportSelect={onSportSelect} />
      <MainContent selectedSport={selectedSport} />
    </div>
  )
}
