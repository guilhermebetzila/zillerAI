// app/api/rendimentos/processar/route.ts
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // caminho relativo real
import Decimal from "decimal.js";

// Função principal para aplicar rendimentos
async function aplicarRendimentos() {
  const usuarios = await prisma.user.findMany({
    include: { investimentos: true },
  });

  const hoje = new Date();
  const dateKey = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

  let totalAplicado = 0;

  await prisma.$transaction(async (tx: typeof prisma) => {
    for (const usuario of usuarios) {
      for (const inv of usuario.investimentos) {
        if (!inv.ativo) continue;

        const base = Number(inv.valor);
        const rate = 0.025;
        const amount = base * rate;

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

        await tx.rendimentoDiario.create({
          data: {
            userId: usuario.id,
            investimentoId: inv.id,
            dateKey,
            base: new Decimal(base),
            rate: new Decimal(rate),
            amount: new Decimal(amount),
          },
        });

        await tx.user.update({
          where: { id: usuario.id },
          data: { saldo: { increment: amount } },
        });

        totalAplicado += amount;
      }
    }
  });

  return totalAplicado;
}

// GET
export async function GET() {
  try {
    const total = await aplicarRendimentos();
    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso (GET)",
      totalAplicado: total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST
export async function POST() {
  try {
    const total = await aplicarRendimentos();
    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso (POST)",
      totalAplicado: total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
