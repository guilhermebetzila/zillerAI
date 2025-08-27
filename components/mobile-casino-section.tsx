"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Zap } from "lucide-react"
import Image from "next/image"

const featuredGames = [
  {
    name: "FORTUNE TIGER",
    image: "/games/fortune-tiger.png",
    category: "Slots",
    exclusive: true,
    hot: true,
  },
  {
    name: "BACCARAT",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cassino3-1uc95OXCUJVYKFMi7r2BZAazAVocEZ.png",
    category: "Mesa",
    dealer: "Sofia",
    live: true,
  },
  {
    name: "SUPER MEGA BALL",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cassino5-FrbBfc1PZ6zSJhsrdXe33804FDC77a.png",
    category: "Game Show",
    dealer: "Carla",
    exclusive: true,
    live: true,
  },
  {
    name: "FORTUNE OX",
    image: "/games/fortune-ox.png",
    category: "Slots",
    hot: true,
  },
  {
    name: "MEGA FIRE BLAZE LUCKY BALL",
    image: "/games/cassino6.png",
    category: "Game Show",
    dealer: "Lucia",
    live: true,
    hot: true,
  },
]

const categories = [
  { name: "Slots", icon: "🎰", count: 234 },
  { name: "Mesa", icon: "🃏", count: 45 },
  { name: "Ao Vivo", icon: "📹", count: 67 },
  { name: "Crash", icon: "🚀", count: 23 },
]

export function MobileCasinoSection() {
  return (
    <div className="space-y-4">
      {/* Banner do cassino */}
      <div className="px-4">
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm mb-1">CASSINO AO VIVO</h3>
              <p className="text-xs opacity-90">Dealers reais 24/7</p>
            </div>
            <div className="text-2xl">🎲</div>
          </div>
        </Card>
      </div>

      {/* Categorias */}
      <div className="px-4">
        <h2 className="text-white font-semibold mb-3 text-sm">Categorias</h2>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <Card
              key={category.name}
              className="bg-gray-800 border-gray-700 p-3 text-center cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-white text-xs font-medium mb-1">{category.name}</div>
              <div className="text-gray-400 text-xs">{category.count}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Jogos em destaque */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Jogos Populares</h2>
          <Button variant="ghost" size="sm" className="text-green-400 text-xs h-auto p-0">
            Ver todos
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredGames.map((game, index) => (
            <Card
              key={index}
              className="bg-gray-800 border-gray-700 overflow-hidden cursor-pointer hover:scale-105 transition-transform relative"
            >
              {/* Badges */}
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {game.exclusive && <Badge className="bg-green-500 text-white text-xs px-1 py-0">EXCLUSIVO</Badge>}
                {game.hot && (
                  <Badge className="bg-red-500 text-white text-xs px-1 py-0">
                    <Zap className="h-2 w-2 mr-1" />
                    HOT
                  </Badge>
                )}
                {game.live && (
                  <Badge className="bg-red-600 text-white text-xs px-1 py-0">
                    <Play className="h-2 w-2 mr-1" />
                    AO VIVO
                  </Badge>
                )}
              </div>

              {/* Play button */}
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
                <Play className="h-3 w-3 text-white fill-current" />
              </div>

              {/* Game image */}
              <div className="aspect-video relative">
                <Image
                  src={game.image || "/placeholder.svg"}
                  alt={game.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* Game info */}
              <div className="p-2">
                <h3 className="font-bold text-xs text-white mb-1 truncate">{game.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{game.category}</span>
                  {game.dealer && <span className="text-xs text-green-400">{game.dealer}</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
