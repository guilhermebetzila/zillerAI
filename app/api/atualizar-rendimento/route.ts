import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function aplicarRendimentos() {
  const usuarios = await prisma.user.findMany({
    select: { id: true, valorInvestido: true },
  });

  const hoje = new Date();
  const dateKey = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

  await prisma.$transaction(async (tx) => {
    for (const usuario of usuarios) {
      const base = Number(usuario.valorInvestido);
      if (base <= 0) continue;

      const rate = 0.025; // 2.5% ao dia
      const amount = base * rate;

      // 🔎 Verifica se já aplicou hoje
      const existe = await tx.rendimentoDiario.findUnique({
        where: {
          userId_dateKey: {
            userId: usuario.id,
            dateKey,
          },
        },
      });

      if (existe) continue;

      // 🔹 Cria registro no histórico
      await tx.rendimentoDiario.create({
        data: {
          userId: usuario.id,
          dateKey,
          base: base.toString(),
          rate: rate.toString(),
          amount: amount.toString(),
        },
      });

      // 🔹 Atualiza saldo do usuário
      await tx.user.update({
        where: { id: usuario.id },
        data: { saldo: { increment: amount } },
      });
    }
  });
}

export async function GET() {
  try {
    await aplicarRendimentos();
    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso (GET)",
    });
  } catch (error) {
    console.error("Erro ao atualizar rendimentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await aplicarRendimentos();
    return NextResponse.json({
      message: "Rendimentos atualizados com sucesso (POST)",
    });
  } catch (error) {
    console.error("Erro ao atualizar rendimentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
