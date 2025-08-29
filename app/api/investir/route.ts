// app/api/investir/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma"; // caminho relativo
import { authOptions } from "../auth/[...nextauth]/authOptions"; // caminho relativo
import Decimal from "decimal.js";

// Tipos auxiliares inferidos
type InvestimentoType = {
  id: string;
  valor: number | null;
  percentualDiario: number | null;
  rendimentoAcumulado: number | null;
  criadoEm: Date;
  ativo: boolean;
};

type RendimentoType = {
  id: string;
  dateKey: string;
  base: number | null;
  rate: number | null;
  amount: number | null;
  createdAt: Date;
};

// GET: retorna saldo, investimentos e rendimentos do usuário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        investimentos: { orderBy: { criadoEm: "desc" } },
        rendimentos: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 💰 Total investido (somente ativos)
    const valorInvestido = (usuario.investimentos as InvestimentoType[])
      .filter((i) => i.ativo)
      .reduce((acc: Decimal, i) => acc.add(new Decimal(i.valor ?? 0)), new Decimal(0));

    // 📦 Formatar investimentos
    const investimentos = (usuario.investimentos as InvestimentoType[]).map((i) => ({
      id: i.id,
      valor: new Decimal(i.valor ?? 0).toString(),
      percentualDiario: new Decimal(i.percentualDiario ?? 0).toString(),
      rendimentoAcumulado: new Decimal(i.rendimentoAcumulado ?? 0).toString(),
      criadoEm: i.criadoEm,
      ativo: i.ativo,
    }));

    // 📦 Formatar rendimentos
    const rendimentos = (usuario.rendimentos as RendimentoType[]).map((r) => ({
      id: r.id,
      dateKey: r.dateKey,
      base: new Decimal(r.base ?? 0).toString(),
      rate: new Decimal(r.rate ?? 0).toString(),
      amount: new Decimal(r.amount ?? 0).toString(),
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      saldo: new Decimal(usuario.saldo ?? 0).toString(),
      valorInvestido: valorInvestido.toString(),
      investimentos,
      rendimentos,
    });
  } catch (error) {
    console.error("❌ Erro em /api/investir:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
