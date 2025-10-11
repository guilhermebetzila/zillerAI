import './globals.css'
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
    <html lang="pt-br" className="dark">
      <body className="relative w-full min-h-screen m-0 p-0 overflow-x-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <BackgroundDots />
        <div className="flex flex-col w-full min-h-screen">
          <Topbar />
          <main className="flex-1 w-full">{children}</main>
          <EsteiraParceiros />
          <Sidebar />
        </div>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
