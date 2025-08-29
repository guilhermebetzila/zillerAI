// app/api/saldo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@lib/prisma"; // usando alias do tsconfig
import Decimal from "decimal.js";

// Tipagem para investimentos do usuário
interface InvestimentoTipo {
  id: number;
  valor: number;
  ativo: boolean;
}

/**
 * POST /api/saldo
 * Registra rendimento diário automático para o usuário (1 vez por dia)
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const email = token.email;

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const investimento = await prisma.investimento.findFirst({
      where: { userId: user.id, ativo: true },
      select: { id: true, valor: true },
    });
    if (!investimento) return NextResponse.json({ error: "Nenhum investimento ativo encontrado" }, { status: 400 });

    const base = new Decimal(investimento.valor);
    const rate = new Decimal(0.01);
    const rendimento = base.mul(rate);

    const dateKey = new Date().toISOString().split("T")[0];

    const rendimentoExistente = await prisma.rendimentoDiario.findUnique({
      where: { userId_investimentoId_dateKey: { userId: user.id, investimentoId: investimento.id, dateKey } },
    });
    if (rendimentoExistente) return NextResponse.json({
      message: "Rendimento de hoje já foi registrado",
      rendimento: rendimentoExistente.amount,
    });

    const novoRendimento = await prisma.rendimentoDiario.create({
      data: {
        userId: user.id,
        investimentoId: investimento.id,
        amount: rendimento.toNumber(),
        base: base.toNumber(),
        rate: rate.toNumber(),
        dateKey,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { saldo: { increment: rendimento.toNumber() } },
    });

    return NextResponse.json({
      message: "Rendimento registrado com sucesso",
      rendimento: novoRendimento.amount,
    });
  } catch (error) {
    console.error("Erro ao registrar rendimento:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

/**
 * GET /api/saldo
 * Retorna saldo, total investido, total de indicados e bônus residual
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const email = token.email;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { investimentos: true, indicados: true },
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const valorInvestido = user.investimentos.reduce(
      (acc: Decimal, inv: InvestimentoTipo) => acc.add(new Decimal(inv.valor)),
      new Decimal(0)
    );

    const bonusResidualTotal = await prisma.rendimentoDiario.aggregate({
      _sum: { amount: true },
      where: { userId: user.id, investimento: { ativo: false } },
    });

    return NextResponse.json({
      saldo: user.saldo,
      valorInvestido: valorInvestido.toNumber(),
      totalIndicados: user.indicados.length,
      bonusResidual: Number(bonusResidualTotal._sum.amount) || 0,
    });
  } catch (error) {
    console.error("Erro ao buscar saldo:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
