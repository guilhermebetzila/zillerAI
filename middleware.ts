// middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        // ✅ só deixa passar se existir token
        return !!token
      },
    },
    pages: {
      signIn: "/login", // ✅ força redirecionar para /login
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/painel/:path*",
    "/minha-conta/:path*",
    "/investimentos/:path*",
    "/indicacoes/:path*",
    // ⚠️ NÃO incluir /login, /register ou /api/*
  ],
}
