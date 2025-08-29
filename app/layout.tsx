// app/layout.tsx
import './globals.css'   // ✅ corrigido
import Providers from './Providers'
import { Topbar } from '../components/TopBar'
import BackgroundDots from '../components/BackgroundDots'
import Sidebar from '../components/Sidebar'
import { EsteiraParceiros } from '../components/EsteiraParceiros'
import { Toaster } from "sonner"

export const metadata = {
  title: 'Ziller.Ia',
  description: 'App oficial Ziller.Ia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="relative bg-[#0a0d1a] text-white w-full min-h-screen m-0 p-0 overflow-x-hidden">
        <BackgroundDots />
        <Providers>
          <div className="flex flex-col w-full min-h-screen">
            <Topbar />
            <main className="flex-1 w-full">{children}</main>

            {/* ESTEIRA ACIMA DO SIDEBAR */}
            <EsteiraParceiros />

            {/* SIDEBAR FIXO EMBAIXO */}
            <Sidebar />
          </div>
        </Providers>

        {/* Toaster para notificações globais */}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
