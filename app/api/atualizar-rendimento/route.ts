import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // alias do tsconfig

async function aplicarRendimentos() {
  const usuarios = await prisma.user.findMany({
    select: { id: true, investimentos: true },
  });

  const hoje = new Date();
  const dateKey = hoje.toISOString().split("T")[0];

  await prisma.$transaction(async (tx: typeof prisma) => {
    for (const usuario of usuarios) {
      for (const investimento of usuario.investimentos) {
        if (!investimento.ativo) continue;

        const base = Number(investimento.valor);
        if (base <= 0) continue;

        const rate = 0.025;
        const amount = base * rate;

        // Verifica se já aplicou hoje
        const existe = await tx.rendimentoDiario.findUnique({
          where: {
            userId_investimentoId_dateKey: {
              userId: usuario.id,
              investimentoId: investimento.id,
              dateKey,
            },
          },
        });

        if (existe) continue;

        // Cria registro do rendimento
        await tx.rendimentoDiario.create({
          data: {
            userId: usuario.id,
            investimentoId: investimento.id,
            dateKey,
            base,
            rate,
            amount,
          },
        });

        // Atualiza saldo do usuário
        await tx.user.update({
          where: { id: usuario.id },
          data: { saldo: { increment: amount } },
        });
      }
    }
  });
}

export async function GET() {
  try {
    await aplicarRendimentos();
    return NextResponse.json({ message: "Rendimentos atualizados com sucesso (GET)" });
  } catch (error) {
    console.error("Erro ao atualizar rendimentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await aplicarRendimentos();
    return NextResponse.json({ message: "Rendimentos atualizados com sucesso (POST)" });
  } catch (error) {
    console.error("Erro ao atualizar rendimentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
