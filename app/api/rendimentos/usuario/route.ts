// app/api/rendimentos/usuario/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // caminho relativo real para o Prisma
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions"; // caminho relativo real
import Decimal from "decimal.js";

// GET: retorna o rendimento do usuário no dia
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    const session = await getServerSession(authOptions).catch(() => null);
    const sessionId = (session?.user as any)?.id;

    const userId = queryUserId ? Number(queryUserId) : Number(sessionId);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 400 });
    }

    const hoje = new Date().toISOString().split("T")[0];

    const rendimentoHoje = await prisma.rendimentoDiario.aggregate({
      where: { userId, dateKey: hoje },
      _sum: { amount: true },
    });

    return NextResponse.json({
      userId,
      rendimento: new Decimal(rendimentoHoje._sum.amount ?? 0).toNumber(),
      dateKey: hoje,
    });
  } catch (error) {
    console.error("Erro ao buscar rendimento:", error);
    return NextResponse.json({ error: "Erro ao buscar rendimento" }, { status: 500 });
  }
}

// POST: aplica rendimentos ao usuário
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    const session = await getServerSession(authOptions).catch(() => null);
    const sessionId = (session?.user as any)?.id;

    const userId = queryUserId ? Number(queryUserId) : Number(sessionId);
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

    const hoje = new Date();
    const dateKey = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

    await prisma.$transaction(async (tx: typeof prisma) => {
      for (const inv of usuario.investimentos) {
        if (!inv.ativo) continue;

        const base = new Decimal(inv.valor);
        const rate = new Decimal(0.025); // 2.5% ao dia
        const amount = base.mul(rate);

        // Verifica se já aplicou hoje
        const existe = await tx.rendimentoDiario.findUnique({
          where: {
            userId_investimentoId_dateKey: {
              userId: usuario.id,
              investimentoId: inv.id,
              dateKey,
            },
          },
        });

        if (existe) continue;

        // Cria registro no histórico
        await tx.rendimentoDiario.create({
          data: {
            userId: usuario.id,
            investimentoId: inv.id,
            dateKey,
            base,
            rate,
            amount,
          },
        });

        // Atualiza saldo do usuário
        await tx.user.update({
          where: { id: usuario.id },
          data: { saldo: { increment: amount.toNumber() } },
        });

        console.log(
          `💰 ${amount.toFixed(2)} USDT aplicados ao usuário ${usuario.id}, investimento ${inv.id}`
        );
      }
    });

    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso (POST)",
    });
  } catch (error) {
    console.error("Erro ao atualizar rendimentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
