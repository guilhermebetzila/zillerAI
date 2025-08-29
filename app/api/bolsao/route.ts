// app/api/bolsao/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // ✅ usa o alias definido no tsconfig

export async function GET() {
  try {
    // 1️⃣ Bolsão Operacional → soma de todos os investimentos ativos
    const bolsaoOperacional = await prisma.investimento.aggregate({
      _sum: { valor: true },
      where: { ativo: true },
    });

    // 2️⃣ Capital da Empresa → soma dos saldos de todos os usuários
    const capitalEmpresa = await prisma.user.aggregate({
      _sum: { saldo: true },
    });

    // 3️⃣ Total de Zilers ativos → usuários que fizeram login nos últimos 5 minutos
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);
    const zilersAtivos = await prisma.user.count({
      where: {
        lastLogin: {
          gte: cincoMinutosAtras,
        },
      },
    });

    // 4️⃣ Lucros distribuídos → soma de rendimentoAcumulado de todos investimentos
    const lucrosDistribuidos = await prisma.investimento.aggregate({
      _sum: { rendimentoAcumulado: true },
    });

    return NextResponse.json({
      bolsaoOperacional: bolsaoOperacional._sum.valor || 0,
      capitalEmpresa: capitalEmpresa._sum.saldo || 0,
      zilersAtivos,
      lucrosDistribuidos: lucrosDistribuidos._sum.rendimentoAcumulado || 0,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do Bolsão:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do Bolsão" },
      { status: 500 }
    );
  }
}
