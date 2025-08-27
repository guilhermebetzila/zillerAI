import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Props = {
  game: { title: string; image: string } | null
  onClose: () => void
}

export default function GameModal({ game, onClose }: Props) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", esc)
    return () => document.removeEventListener("keydown", esc)
  }, [])

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1f1f1f] rounded-lg overflow-hidden shadow-lg w-full
              max-w-[90%]
              sm:max-w-sm
              md:max-w-md
              lg:max-w-lg
              xl:max-w-xl
              2xl:max-w-2xl"
          >
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-white text-center">
              <h2 className="text-xl font-bold mb-2">{game.title}</h2>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Fechar
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Jogar Agora
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
