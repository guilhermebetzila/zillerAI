import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * POST /api/saldo
 * Registra rendimento diário automático para o usuário (apenas 1 vez por dia)
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const email = token.email;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Busca um investimento ativo do usuário
    const investimento = await prisma.investimento.findFirst({
      where: { userId: user.id, ativo: true },
      select: { id: true, valor: true },
    });

    if (!investimento) {
      return NextResponse.json({
        error: "Nenhum investimento ativo encontrado",
      }, { status: 400 });
    }

    const base = investimento.valor;
    const rate = 0.01; // 1% ao dia
    const rendimento = base.mul(new Prisma.Decimal(rate));

    // Chave única por dia
    const dateKey = new Date().toISOString().split("T")[0];

    // Verifica se já existe rendimento registrado hoje para este investimento
    const rendimentoExistente = await prisma.rendimentoDiario.findUnique({
      where: {
        userId_investimentoId_dateKey: {
          userId: user.id,
          investimentoId: investimento.id,
          dateKey,
        },
      },
    });

    if (rendimentoExistente) {
      return NextResponse.json({
        message: "Rendimento de hoje já foi registrado",
        rendimento: rendimentoExistente.amount,
      });
    }

    // Salvar rendimento vinculado ao investimento
    const novoRendimento = await prisma.rendimentoDiario.create({
      data: {
        userId: user.id,
        investimentoId: investimento.id,
        amount: rendimento,
        base,
        rate: new Prisma.Decimal(rate),
        dateKey,
      },
    });

    // Atualizar saldo do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        saldo: { increment: rendimento },
      },
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
 * Retorna os dados consolidados para o dashboard do usuário, incluindo histórico de bônus residual
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const email = token.email;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        investimentos: true,
        indicados: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Total investido
    const valorInvestido = user.investimentos.reduce(
      (acc, inv) => acc.add(inv.valor),
      new Prisma.Decimal(0)
    );

    // Total de bônus residual histórico (todos os rendimentos de investimentos inativos)
    const bonusResidualTotal = await prisma.rendimentoDiario.aggregate({
      _sum: { amount: true },
      where: {
        userId: user.id,
        investimento: { ativo: false }, // apenas investimentos inativos (residual)
      },
    });

    return NextResponse.json({
      saldo: user.saldo,
      valorInvestido,
      totalIndicados: user.indicados.length,
      bonusResidual: Number(bonusResidualTotal._sum.amount) || 0,
    });
  } catch (error) {
    console.error("Erro ao buscar saldo:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
