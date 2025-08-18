import { withAuth, NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Se já estiver logado, não deixa voltar pro login
    if (token && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token
      },
    },
    pages: {
      signIn: '/login',
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
    '/login', // Mantém o login
    // ❌ Não intercepta mais o /register
  ],
}
