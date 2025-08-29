// app/api/depositar/historico/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@lib/prisma"; // ✅ alias corrigido

export async function GET(req: NextRequest) {
  try {
    // 🔑 Recupera o token do usuário logado
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 🔎 Busca usuário no banco
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // 📌 Busca depósitos internos (Pix)
    const depositosPix = await prisma.deposito.findMany({
      where: { userId: user.id },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        valor: true,
        criadoEm: true,
        status: true, // ✅ status incluído
      },
    });

    return NextResponse.json({
      usuario: {
        id: user.id,
        email: user.email,
      },
      depositosPix,
    });
  } catch (error) {
    console.error("Erro no histórico de depósitos:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar histórico de depósitos" },
      { status: 500 }
    );
  }
}
