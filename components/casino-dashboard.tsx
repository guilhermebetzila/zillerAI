"use client"

import { Search, Home, Trophy, Newspaper, Video, Zap, Plane, Target, Users, Star, Gamepad2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"

const navigationIcons = [
  { icon: Home, label: "Home", active: false },
  { icon: Trophy, label: "Esportes", active: false },
  { icon: Newspaper, label: "Novidades", active: false },
  { icon: Video, label: "Cassino Ao Vivo", active: false },
  { icon: Zap, label: "Zeppelin", active: false },
  { icon: Plane, label: "Jogos Crash e Aviator", active: true },
  { icon: Target, label: "Bingo", active: false },
  { icon: Users, label: "Jogos de Mesa e Cartas", active: false },
  { icon: Star, label: "Jackpots", active: false },
  { icon: Gamepad2, label: "Todos os Jogos", active: false },
]

const promoBanners = [
  {
    id: 1,
    title: "FAÇA PARTE DO CLUBE",
    subtitle: "betDreams",
    bgColor: "from-green-600 to-blue-600",
    textColor: "text-white",
    image: null,
  },
  {
    id: 2,
    title: "VIKINGS GO TO OLYMPUS",
    subtitle: "Exclusivo da betDreams",
    bgColor: "from-teal-500 to-green-500",
    textColor: "text-white",
    image: "/games/vikings-olympus.webp",
  },
  {
    id: 3,
    title: "CASH STRIKE",
    subtitle: "POWER UP",
    bgColor: "from-red-600 to-orange-500",
    textColor: "text-white",
    image: "/games/cash-strike.webp",
  },
  {
    id: 4,
    title: "LIGHTNING FORTUNES",
    subtitle: "Exclusivo da betDreams",
    bgColor: "from-purple-600 to-blue-600",
    textColor: "text-white",
    image: "/games/lightning-fortunes.webp",
  },
]

const crashGames = [
  { name: "FORTUNE TIGER", color: "from-orange-600 to-yellow-500", exclusive: true, image: "/games/fortune-tiger.png" },
  { name: "FORTUNE OX", color: "from-red-600 to-orange-500", exclusive: false, image: "/games/fortune-ox.png" },
  { name: "FORTUNE COIN", color: "from-purple-700 to-blue-600", exclusive: true, image: "/games/fortune-coin.jpeg" },
  {
    name: "LINKS OF RA",
    subtitle: "CASHINGO",
    color: "from-yellow-600 to-orange-500",
    exclusive: false,
    image: "/games/links-of-ra.webp",
  },
  {
    name: "LIGHTNING",
    subtitle: "FORTUNES",
    color: "from-blue-700 to-purple-600",
    exclusive: false,
    image: "/games/lightning-fortunes.webp",
  },
  {
    name: "CASH STRIKE",
    subtitle: "POWER UP",
    color: "from-red-700 to-black",
    exclusive: false,
    image: "/games/cash-strike.webp",
  },
]

const liveGames = [
  {
    name: "Roulette",
    dealer: "Ana",
    bgImage: "https://blob.v0.dev/pjtmy8OGJ.png",
    hasRealImage: true,
  },
  {
    name: "Super Spin",
    subtitle: "Roulette",
    dealer: "Maria",
    bgImage: "https://blob.v0.dev/pjtmy8OGJ.png",
    hasRealImage: true,
  },
  {
    name: "Baccarat",
    dealer: "Sofia",
    bgImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cassino3-1uc95OXCUJVYKFMi7r2BZAazAVocEZ.png",
    hasRealImage: true,
  },
  {
    name: "All Bets",
    subtitle: "Blackjack",
    dealer: "Julia",
    bgImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cassino4-Q2itQlFM1QjF2ThleA7NaIs658UmmQ.png",
    hasRealImage: true,
  },
  {
    name: "Super Mega Ball",
    dealer: "Carla",
    bgImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cassino5-FrbBfc1PZ6zSJhsrdXe33804FDC77a.png",
    exclusive: true,
    hasRealImage: true,
  },
  {
    name: "Mega Fire",
    subtitle: "Blaze Lucky Ball",
    dealer: "Lucia",
    bgImage: "/games/cassino6.png",
    hasRealImage: true,
    exclusive: true,
  },
  { name: "Mega Fire", subtitle: "Blaze Roulette", dealer: "Patricia", bgImage: null, hasRealImage: false },
]

interface CasinoDashboardProps {
  isVisible: boolean
  onClose: () => void
}

export function CasinoDashboard({ isVisible, onClose }: CasinoDashboardProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar"
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Navigation Icons */}
          <div className="flex gap-6 overflow-x-auto">
            {navigationIcons.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={index}
                  className={`flex flex-col items-center gap-1 min-w-[60px] p-2 rounded transition-colors ${
                    item.active ? "text-cyan-400" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs text-center leading-tight">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
            Voltar aos Esportes
          </Button>
        </div>

        {/* Promotional Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {promoBanners.map((banner) => (
            <Card
              key={banner.id}
              className={`${banner.image ? "bg-gray-800" : `bg-gradient-to-r ${banner.bgColor}`} border-0 cursor-pointer hover:scale-105 transition-transform overflow-hidden relative h-48`}
            >
              {banner.image ? (
                <div className="relative h-full">
                  <Image
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      console.log("Image failed to load:", banner.image)
                      e.currentTarget.style.display = "none"
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                    EXCLUSIVO
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="text-white">
                      <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                      <div className="text-sm opacity-90">{banner.subtitle}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-6 h-full flex flex-col justify-center ${banner.textColor}`}>
                  <div className="text-xs mb-1">Fidelidade betDreams</div>
                  <h3 className="text-lg font-bold mb-2">{banner.title}</h3>
                  {banner.subtitle && <div className="text-sm opacity-90 mb-3">{banner.subtitle}</div>}
                  <Button size="sm" className="bg-yellow-500 text-black hover:bg-yellow-400 w-fit">
                    Registre-se
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Crash Games Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">JOGOS DE CRASH</h2>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 bg-transparent">
              Ver Todos
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {crashGames.map((game, index) => (
              <Card
                key={index}
                className="bg-gray-800 border-0 cursor-pointer hover:scale-105 transition-transform relative overflow-hidden"
              >
                {game.exclusive && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                    EXCLUSIVO
                  </div>
                )}
                <div className="relative h-32">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      console.log("Game image failed to load:", game.image)
                      // Fallback to gradient background
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.className = `relative h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`
                        parent.innerHTML = `<div class="text-white font-bold text-xs text-center px-2">${game.name}</div>`
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
                    <span className="text-white text-xs">▶</span>
                  </div>
                </div>
                <div className="p-2 text-center bg-gray-800">
                  <h3 className="font-bold text-xs text-white mb-1">{game.name}</h3>
                  {game.subtitle && <div className="text-xs text-gray-300">{game.subtitle}</div>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Live Casino Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">CASSINO AO-VIVO</h2>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 bg-transparent">
              Ver Todos
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {liveGames.map((game, index) => (
              <Card
                key={index}
                className="bg-gray-800 border-gray-700 overflow-hidden cursor-pointer hover:scale-105 transition-transform relative"
              >
                {game.exclusive && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                    EXCLUSIVO
                  </div>
                )}
                <div className="aspect-video relative overflow-hidden">
                  {game.hasRealImage && game.bgImage ? (
                    <Image
                      src={game.bgImage || "/placeholder.svg"}
                      alt={`${game.name} - ${game.dealer}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.log("Dealer image failed to load:", game.bgImage)
                        // Fallback to gradient background
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 relative">
                              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                              <div class="absolute bottom-2 left-2 text-white">
                                <div class="text-sm font-bold">${game.name}</div>
                                ${game.subtitle ? `<div class="text-xs opacity-90">${game.subtitle}</div>` : ""}
                              </div>
                            </div>
                          `
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 text-white">
                        <div className="text-sm font-bold">{game.name}</div>
                        {game.subtitle && <div className="text-xs opacity-90">{game.subtitle}</div>}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
                    <span className="text-white text-xs">▶</span>
                  </div>
                </div>
                <div className="p-2 text-center bg-gray-800">
                  <div className="text-white text-xs">{game.dealer}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
