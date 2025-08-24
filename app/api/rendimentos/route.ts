import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

async function gerarRendimentoDiario() {
  const usuarios = await prisma.user.findMany({
    include: { investimentos: true },
  });

  const hoje = new Date();
  const dateKey = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

  let totalAplicado = 0;

  await prisma.$transaction(async (tx) => {
    for (const usuario of usuarios) {
      for (const inv of usuario.investimentos) {
        if (!inv.ativo) continue;

        const base = Number(inv.valor);
        const rate = 0.025; // 2,5% ao dia
        const amount = base * rate;

        // Verifica se já aplicou hoje
        const jaRodou = await tx.rendimentoDiario.findUnique({
          where: {
            userId_investimentoId_dateKey: {
              userId: usuario.id,
              investimentoId: inv.id,
              dateKey,
            },
          },
        });
        if (jaRodou) continue;

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

        totalAplicado += amount;
        console.log(
          `💰 R$ ${amount.toFixed(2)} aplicados ao usuário ${usuario.id}, investimento ${inv.id}`
        );
      }
    }
  });

  return { totalAplicado };
}

// Rota POST para gerar rendimentos
export async function POST() {
  try {
    const resultado = await gerarRendimentoDiario();
    return NextResponse.json({
      message: "Rendimentos gerados com sucesso",
      totalAplicado: resultado.totalAplicado,
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar rendimentos:", error);
    return NextResponse.json({ error: "Erro ao gerar rendimentos" }, { status: 500 });
  }
}

// Rota GET opcional para verificar rendimentos do último dia
export async function GET() {
  try {
    const ultimo = await prisma.rendimentoDiario.findFirst({
      orderBy: { createdAt: "desc" },
      select: { userId: true, investimentoId: true, amount: true, dateKey: true },
    });

    if (!ultimo) {
      return NextResponse.json({ message: "Nenhum rendimento gerado ainda" });
    }

    return NextResponse.json(ultimo);
  } catch (error) {
    console.error("Erro ao buscar rendimento:", error);
    return NextResponse.json({ error: "Erro ao buscar rendimento" }, { status: 500 });
  }
}
