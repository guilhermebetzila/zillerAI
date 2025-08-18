import { withAuth, NextRequestWithAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname, searchParams } = req.nextUrl
    const token = req.nextauth.token

    // Se já estiver logado, não deixa acessar login/register
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Evita callbackUrl infinito para /login (loop ERR_TOO_MANY_REDIRECTS)
    if (searchParams.get('callbackUrl')?.includes('/login')) {
      const url = new URL(req.url)
      url.searchParams.delete('callbackUrl')
      return NextResponse.redirect(url)
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
    '/login',
    '/register',
  ],
}
