export function TopNavigation() {
  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex gap-6">
            <button className="text-yellow-400 border-b-2 border-yellow-400 pb-1 text-sm font-medium">Esportes</button>
            <button className="text-gray-300 hover:text-white text-sm">Cassino</button>
            <button className="text-gray-300 hover:text-white text-sm">Extra</button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <button className="hover:text-white">Jogo Responsável</button>
          <button className="hover:text-white">Ajuda</button>
        </div>
      </div>
    </div>
  )
}
