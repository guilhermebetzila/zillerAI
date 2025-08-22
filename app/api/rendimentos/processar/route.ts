import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Função utilitária para pegar YYYY-MM-DD no fuso de São Paulo (BRT/UTC-3)
function getDateKeyBRT(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const dia = parts.find((p) => p.type === "day")?.value;
  const mes = parts.find((p) => p.type === "month")?.value;
  const ano = parts.find((p) => p.type === "year")?.value;
  return `${ano}-${mes}-${dia}`;
}

export async function GET() {
  try {
    const dateKey = getDateKeyBRT(); // ✅ já pega a data no horário do Brasil
    const rate = 0.01; // 1% ao dia (ajuste aqui se quiser mudar a taxa)

    // Evita rodar duas vezes no mesmo dia
    const jaProcessado = await prisma.rendimentoDiario.findFirst({
      where: { dateKey },
    });

    if (jaProcessado) {
      return NextResponse.json({
        message: "⚠️ Rendimentos já processados hoje",
      });
    }

    // Busca usuários que têm valor investido > 0
    const usuarios = await prisma.user.findMany({
      where: {
        valorInvestido: { gt: new Prisma.Decimal(0) },
      },
      select: {
        id: true,
        valorInvestido: true,
      },
    });

    // Aplica rendimento para cada usuário
    for (const usuario of usuarios) {
      const base = usuario.valorInvestido.toNumber();
      const rendimento = base * rate;

      // Registra na tabela de rendimentos
      await prisma.rendimentoDiario.create({
        data: {
          userId: usuario.id,
          amount: new Prisma.Decimal(rendimento),
          base: new Prisma.Decimal(base),
          rate: new Prisma.Decimal(rate),
          dateKey,
        },
      });

      // Atualiza o saldo do usuário
      await prisma.user.update({
        where: { id: usuario.id },
        data: {
          saldo: { increment: rendimento },
        },
      });
    }

    return NextResponse.json({
      message: `✅ Rendimentos processados para ${usuarios.length} usuários em ${dateKey} (BRT)`,
    });
  } catch (error) {
    console.error("Erro no cron de rendimentos:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
