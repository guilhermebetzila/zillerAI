// app/api/depositar/historico/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca usuário logado
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Busca depósitos internos (Pix)
    const depositos = await prisma.deposito.findMany({
      where: { userId: user.id },
      orderBy: { criadoEm: "desc" },
      select: { id: true, valor: true, criadoEm: true, status: true }, // agora com status
    });

    return NextResponse.json(depositos);
  } catch (error) {
    console.error("Erro no histórico de depósitos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
