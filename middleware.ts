import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/painel/:path*',
    '/minha-conta/:path*',
    '/investimentos/:path*',
    '/indicacoes/:path*',
    // ❌ não adicionamos /login nem /register
  ],
}
