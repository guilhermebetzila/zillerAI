export function SportsNavigation() {
  const navItems = [
    "Mundial de Clubes",
    "Série B",
    "Futebol",
    "Wimbledon",
    "Wimbledon - Feminino",
    "E-Sports",
    "Liga Nacional de Futsal",
    "NBA",
    "GP da Grã-Bretanha",
    "E-basketball",
    "Transferências - Especiais",
    "Ao-Vivo",
  ]

  return (
    <div className="px-4 py-3 border-b border-gray-700">
      <div className="flex gap-6 text-sm overflow-x-auto">
        {navItems.map((item, index) => (
          <button
            key={item}
            className={`whitespace-nowrap ${
              index === 0 ? "text-white font-medium border-b-2 border-white pb-1" : "text-gray-400 hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
