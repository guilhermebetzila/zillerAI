import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { Decimal } from "decimal.js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = queryUserId ? Number(queryUserId) : Number((session?.user as any)?.id);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 400 });
    }

    const hoje = new Date().toISOString().split("T")[0];

    // 🔹 Rendimento diário do usuário
    const rendimentoHoje = await prisma.rendimentoDiario.aggregate({
      where: { userId, dateKey: hoje },
      _sum: { amount: true },
    });
    const rendimentoDiario = new Decimal(rendimentoHoje._sum.amount ?? 0);

    // 🔹 Bônus residual: 5% do rendimento diário dos indicados diretos
    const indicados = await prisma.user.findMany({
      where: { indicadoPorId: userId },
      include: { investimentos: true },
    });

    let bonusResidual = new Decimal(0);
    for (const indicado of indicados) {
      for (const inv of indicado.investimentos) {
        if (!inv.ativo) continue;
        const base = new Decimal(inv.valor);
        const rate = new Decimal(inv.percentualDiario);
        const amount = base.mul(rate);
        bonusResidual = bonusResidual.add(amount.mul(0.05));
      }
    }

    return NextResponse.json({
      userId,
      rendimento: rendimentoDiario.toNumber(),
      bonusResidual: bonusResidual.toNumber(),
      dateKey: hoje,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar rendimento" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = queryUserId ? Number(queryUserId) : Number((session?.user as any)?.id);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 400 });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      include: { investimentos: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const hoje = new Date().toISOString().split("T")[0];

    await prisma.$transaction(async (tx) => {
      for (const inv of usuario.investimentos) {
        if (!inv.ativo) continue;

        const base = new Decimal(inv.valor);
        const rate = new Decimal(inv.percentualDiario);
        const amount = base.mul(rate);

        const existe = await tx.rendimentoDiario.findUnique({
          where: {
            userId_investimentoId_dateKey: {
              userId: usuario.id,
              investimentoId: inv.id,
              dateKey: hoje,
            },
          },
        });
        if (existe) continue;

        await tx.rendimentoDiario.create({
          data: {
            userId: usuario.id,
            investimentoId: inv.id,
            dateKey: hoje,
            base,
            rate,
            amount,
          },
        });

        await tx.user.update({
          where: { id: usuario.id },
          data: { saldo: { increment: amount.toNumber() } },
        });

        await tx.investimento.update({
          where: { id: inv.id },
          data: { rendimentoAcumulado: inv.rendimentoAcumulado.add(amount) },
        });
      }
    });

    // 🔹 Rendimento diário atualizado
    const rendimentoHoje = await prisma.rendimentoDiario.aggregate({
      where: { userId, dateKey: hoje },
      _sum: { amount: true },
    });
    const rendimentoDiario = new Decimal(rendimentoHoje._sum.amount ?? 0);

    // 🔹 Bônus residual atualizado
    const indicados = await prisma.user.findMany({
      where: { indicadoPorId: userId },
      include: { investimentos: true },
    });

    let bonusResidual = new Decimal(0);
    for (const indicado of indicados) {
      for (const inv of indicado.investimentos) {
        if (!inv.ativo) continue;
        const base = new Decimal(inv.valor);
        const rate = new Decimal(inv.percentualDiario);
        const amount = base.mul(rate);
        bonusResidual = bonusResidual.add(amount.mul(0.05));
      }
    }

    // 🔹 Atualiza o saldo com o bônus residual
    if (bonusResidual.greaterThan(0)) {
      await prisma.user.update({
        where: { id: userId },
        data: { saldo: { increment: bonusResidual.toNumber() } },
      });
    }

    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso!",
      userId,
      rendimento: rendimentoDiario.toNumber(),
      bonusResidual: bonusResidual.toNumber(),
      dateKey: hoje,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
