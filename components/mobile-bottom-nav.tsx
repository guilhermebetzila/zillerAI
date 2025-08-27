"use client"

import { Home, Trophy, Zap, Gamepad2, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: "home", icon: Home, label: "Início" },
  { id: "sports", icon: Trophy, label: "Esportes" },
  { id: "live", icon: Zap, label: "Ao Vivo" },
  { id: "casino", icon: Gamepad2, label: "Cassino" },
  { id: "profile", icon: User, label: "Perfil" },
]

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-0",
                isActive ? "text-green-400 bg-green-900/30" : "text-gray-400 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          )
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-gray-800"></div>
    </div>
  )
}
