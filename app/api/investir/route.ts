// app/api/investir/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    // 🔒 Sessão
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // 🔎 Usuário + investimentos + rendimentos
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        investimentos: {
          orderBy: { criadoEm: "desc" },
        },
        rendimentos: {
          orderBy: { createdAt: "desc" }, // ✅ corrigido
        },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 💰 Total investido (somente ativos)
    const valorInvestidoDecimal = usuario.investimentos
      .filter((i) => i.ativo)
      .reduce(
        (acc, i) => acc.plus(i.valor ?? new Prisma.Decimal(0)),
        new Prisma.Decimal(0)
      );

    // 📦 Resposta formatada
    return NextResponse.json({
      saldo: usuario.saldo?.toString() ?? "0",
      valorInvestido: valorInvestidoDecimal.toString(),
      investimentos: usuario.investimentos.map((i) => ({
        id: i.id,
        valor: i.valor?.toString() ?? "0",
        percentualDiario: i.percentualDiario?.toString() ?? "0",
        rendimentoAcumulado: i.rendimentoAcumulado?.toString() ?? "0",
        criadoEm: i.criadoEm,
        ativo: i.ativo,
      })),
      rendimentos: usuario.rendimentos.map((r) => ({
        id: r.id,
        dateKey: r.dateKey,
        base: r.base?.toString() ?? "0",
        rate: r.rate?.toString() ?? "0",
        amount: r.amount?.toString() ?? "0",
        createdAt: r.createdAt, // ✅ corrigido
      })),
    });
  } catch (error) {
    console.error("❌ Erro em /api/investir:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
