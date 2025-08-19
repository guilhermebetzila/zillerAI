// app/api/investir/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET() {
  try {
    // 🔒 Verifica sessão
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // 🔎 Busca usuário e dados relacionados
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        investimentos: true,
        rendimentos: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 💰 Calcula total investido (só ativos)
    const valorInvestido = usuario.investimentos
      .filter((i) => i.ativo)
      .reduce((acc, i) => acc + Number(i.valor), 0);

    return NextResponse.json({
      saldo: usuario.saldo.toString(),
      valorInvestido: valorInvestido.toString(),
      investimentos: usuario.investimentos.map((i) => ({
        id: i.id,
        valor: i.valor.toString(),
        percentualDiario: i.percentualDiario.toString(),
        rendimentoAcumulado: i.rendimentoAcumulado.toString(),
        limite: i.limite.toString(),
        criadoEm: i.criadoEm,
        ativo: i.ativo,
      })),
      rendimentos: usuario.rendimentos.map((r) => ({
        id: r.id,
        dateKey: r.dateKey,
        base: r.base.toString(),
        rate: r.rate.toString(),
        amount: r.amount.toString(),
        creditedAt: r.creditedAt,
      })),
    });
  } catch (error) {
    console.error("❌ Erro em /api/investir:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
