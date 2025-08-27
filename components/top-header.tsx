'use client'

type TopHeaderProps = {
  onMenuClick: () => void
}

export default function TopHeader({ onMenuClick }: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#141414] text-white flex items-center justify-between px-4 py-3 z-50 md:hidden">
      <button onClick={onMenuClick} className="text-white">
        {/* Ícone de menu ou texto */}
        ☰
      </button>
      <h1 className="text-lg font-semibold">BetDreams</h1>
    </header>
  )
}

