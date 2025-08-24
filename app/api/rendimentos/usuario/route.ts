import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    // Pega usuário logado (caso não passe query param)
    const session = await getServerSession(authOptions).catch(() => null);
    const sessionId = (session?.user as any)?.id;

    const userId = queryUserId ? Number(queryUserId) : Number(sessionId);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 400 });
    }

    // Busca último rendimento do usuário
    const ultimo = await prisma.rendimentoDiario.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        amount: true,
        dateKey: true,
        createdAt: true
      },
    });

    if (!ultimo) {
      return NextResponse.json({
        userId,
        rendimento: 0,
        message: "Nenhum rendimento gerado ainda",
      });
    }

    return NextResponse.json({
      userId,
      rendimento: Number(ultimo.amount.toString()), // garante conversão Decimal -> number
      data: ultimo.dateKey,
      createdAt: ultimo.createdAt,
    });
  } catch (error) {
    console.error("Erro ao buscar rendimento:", error);
    return NextResponse.json({ error: "Erro ao buscar rendimento" }, { status: 500 });
  }
}

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

    // Busca todos os investimentos ativos do usuário
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      include: { investimentos: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const hoje = new Date();
    const dateKey = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

    await prisma.$transaction(async (tx) => {
      for (const inv of usuario.investimentos) {
        if (!inv.ativo) continue;

        const base = Number(inv.valor);
        const rate = 0.025; // 2.5% ao dia
        const amount = base * rate;

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
            base: new Prisma.Decimal(base),
            rate: new Prisma.Decimal(rate),
            amount: new Prisma.Decimal(amount),
          },
        });

        // Atualiza saldo do usuário
        await tx.user.update({
          where: { id: usuario.id },
          data: { saldo: { increment: amount } },
        });

        console.log(
          `💰 R$ ${amount.toFixed(2)} aplicados ao usuário ${usuario.id}, investimento ${inv.id}`
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
