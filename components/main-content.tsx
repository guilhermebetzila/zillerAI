"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PromotionalBanners } from "@/components/promotional-banners"
import { SportsIconsGrid } from "@/components/sports-icons-grid"
import { SportsNavigation } from "@/components/sports-navigation"
import { WorldCupSection } from "@/components/world-cup-section"

interface MainContentProps {
  selectedSport: string
}

export function MainContent({ selectedSport }: MainContentProps) {
  return (
    <main className="flex-1 bg-gray-900">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar"
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 h-9"
          />
        </div>
      </div>

      {/* Promotional Banners */}
      <PromotionalBanners />

      {/* Sports Icons Grid */}
      <SportsIconsGrid />

      {/* Sports Navigation */}
      <SportsNavigation />

      {/* World Cup Section */}
      <WorldCupSection />
    </main>
  )
}
