// app/api/rendimentos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // caminho relativo correto

// Função para gerar rendimentos diários
async function gerarRendimentoDiario() {
  const usuarios = await prisma.user.findMany({
    include: { investimentos: true },
  });

  const hoje = new Date();
  const dateKey = hoje.toISOString().split("T")[0];

  let totalAplicado = 0;

  // ✅ Removida tipagem do parâmetro do $transaction
  await prisma.$transaction(async (tx) => {
    for (const usuario of usuarios) {
      for (const inv of usuario.investimentos) {
        if (!inv.ativo) continue;

        const base = Number(inv.valor ?? 0);
        // ✅ Ajuste da taxa diária para 1.5%
        const rate = 0.015;
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

        // Cria registro do rendimento diário
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
          data: { saldo: { increment: amount } },
        });

        totalAplicado += amount;
      }
    }
  });

  return { totalAplicado };
}

// POST → Aplica rendimentos
export async function POST() {
  try {
    const resultado = await gerarRendimentoDiario();
    return NextResponse.json(
      { message: "Rendimentos gerados com sucesso", totalAplicado: resultado.totalAplicado },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao gerar rendimentos:", error);
    return NextResponse.json({ error: "Erro ao gerar rendimentos" }, { status: 500 });
  }
}

// GET → Retorna rendimentos do dia
export async function GET() {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const rendimentosHoje = await prisma.rendimentoDiario.groupBy({
      by: ["userId", "dateKey"],
      where: { dateKey: hoje },
      _sum: { amount: true },
    });
    return NextResponse.json(rendimentosHoje);
  } catch (error) {
    console.error("Erro ao buscar rendimento:", error);
    return NextResponse.json({ error: "Erro ao buscar rendimento" }, { status: 500 });
  }
}
