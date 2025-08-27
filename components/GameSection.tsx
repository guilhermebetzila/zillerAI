"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import GameModal from "./GameModal"

type Game = {
  title: string
  image: string
}

type Props = {
  title: string
  games: Game[]
}

export default function GameSection({ title, games }: Props) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (title: string) => {
    setFavorites((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const isFavorite = (title: string) => favorites.includes(title)

  return (
    <section className="mb-10 px-2">
      <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>

      {/* Grid responsivo: adapta de 2 até 7 colunas conforme tamanho da tela */}
      <div
        className="
          grid gap-4
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
          2xl:grid-cols-7
        "
      >
        {games.map((game, i) => (
          <motion.div
            key={i}
            onClick={() => setSelectedGame(game)}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative bg-[#1f1f1f] rounded-xl shadow cursor-pointer overflow-hidden"
          >
            {/* Coração de favorito */}
            <div
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(game.title)
              }}
              className="absolute top-2 right-2 text-white text-xl z-10"
              role="button"
              aria-label="Favoritar"
            >
              {isFavorite(game.title) ? "❤️" : "🤍"}
            </div>

            <img
              src={game.image}
              alt={game.title}
              className="w-full h-28 sm:h-32 md:h-36 lg:h-40 object-cover rounded-t-xl"
            />
            <div className="text-white text-sm font-medium text-center p-2">
              {game.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de jogo */}
      <GameModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </section>
  )
}
