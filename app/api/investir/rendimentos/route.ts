// app/api/investir/rendimentos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET() {
  try {
    // 🔒 Verifica sessão
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const email = session.user.email;

    // 🔎 Busca usuário com rendimentos
    const usuario = await prisma.user.findUnique({
      where: { email },
      include: {
        rendimentos: {
          orderBy: { creditedAt: "desc" },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 🔄 Mapeia rendimentos convertendo Decimal para string
    const rendimentos = usuario.rendimentos.map((r) => ({
      id: r.id,
      dateKey: r.dateKey,
      base: r.base?.toString() ?? "0",
      rate: r.rate?.toString() ?? "0",
      amount: r.amount?.toString() ?? "0",
      creditedAt: r.creditedAt,
    }));

    return NextResponse.json({
      total: rendimentos.length,
      rendimentos,
    });
  } catch (error) {
    console.error("❌ Erro em /api/investir/rendimentos:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
