// app/api/user/me/route.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
// ✅ ajuste: usar caminho relativo ao invés de alias "@/lib/prisma"
import { prisma } from "../../../../lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // 🔒 Obtém token da sessão
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.id) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const userId = Number(token.id);
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    // 🔎 Busca usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nome: true,
        saldo: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
