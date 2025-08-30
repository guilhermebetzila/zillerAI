import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST() {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const investimentos = await prisma.investimento.findMany({ where: { ativo: true }, include: { user: true } });

    let totalAplicado = new Decimal(0);

    await prisma.$transaction(async (tx) => {
      for (const inv of investimentos) {
        const base = new Decimal(inv.valor);
        const rate = new Decimal(inv.percentualDiario);
        const amount = base.mul(rate);

        const jaRegistrado = await tx.rendimentoDiario.findUnique({
          where: { userId_investimentoId_dateKey: { userId: inv.userId, investimentoId: inv.id, dateKey: hoje } },
        });
        if (jaRegistrado) continue;

        await tx.rendimentoDiario.create({
          data: { userId: inv.userId, investimentoId: inv.id, dateKey: hoje, base, rate, amount },
        });

        await tx.user.update({ where: { id: inv.userId }, data: { saldo: { increment: amount.toNumber() } } });
        await tx.investimento.update({ where: { id: inv.id }, data: { rendimentoAcumulado: inv.rendimentoAcumulado.add(amount) } });

        totalAplicado = totalAplicado.add(amount);
      }
    });

    return NextResponse.json({ message: "Rendimentos aplicados com sucesso!", totalAplicado: totalAplicado.toNumber() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const rendimentosHoje = await prisma.rendimentoDiario.groupBy({ by: ["userId", "dateKey"], where: { dateKey: hoje }, _sum: { amount: true } });
    return NextResponse.json(rendimentosHoje);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar rendimento" }, { status: 500 });
  }
}
