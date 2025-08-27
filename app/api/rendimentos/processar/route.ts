import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

async function aplicarRendimentos() {
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
        const rate = 0.025; // 2.5% ao dia
        const amount = base * rate;

        // 🔎 Verifica se já aplicou hoje
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

        // 🔹 Cria registro no histórico
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

        // 🔹 Atualiza saldo do usuário
        await tx.user.update({
          where: { id: usuario.id },
          data: { saldo: { increment: amount } },
        });

        totalAplicado += amount;
        console.log(
          `💰 ${amount.toFixed(2)} USDT aplicados ao usuário ${usuario.id}, investimento ${inv.id}`
        );
      }
    }
  });

  return totalAplicado;
}

// GET ou POST pode chamar a mesma função
export async function GET() {
  try {
    const total = await aplicarRendimentos();
    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso (GET)",
      totalAplicado: total,
    });
  } catch (error) {
    console.error("Erro ao atualizar rendimentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const total = await aplicarRendimentos();
    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso (POST)",
      totalAplicado: total,
    });
  } catch (error) {
    console.error("Erro ao atualizar rendimentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
