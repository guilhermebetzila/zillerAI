// /app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // 🔒 Obtém token da sessão
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const email = token.email;

    // 🔎 Busca usuário com campos específicos
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, cpf: true, saldo: true, valorInvestido: true },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("[ERRO ME]", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
