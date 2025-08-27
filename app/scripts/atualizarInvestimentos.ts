import { prisma } from "./prisma.js";
import { Decimal } from "@prisma/client/runtime/library";

async function atualizarInvestimentos() {
  const hoje = new Date().toISOString().split("T")[0];

  const investimentos = await prisma.investimento.findMany({
    where: { ativo: true },
    include: { user: true },
  });

  for (const investimento of investimentos) {
    try {
      const base = investimento.valor;
      const rate = investimento.percentualDiario;
      const rendimento = new Decimal(base).mul(rate);

      const existente = await prisma.rendimentoDiario.findUnique({
        where: {
          userId_investimentoId_dateKey: {
            userId: investimento.userId,
            investimentoId: investimento.id,
            dateKey: hoje,
          },
        },
      });

      if (existente) {
        await prisma.rendimentoDiario.update({
          where: { id: existente.id },
          data: {
            amount: existente.amount.plus(rendimento),
            base: existente.base.plus(base),
            rate: existente.rate.plus(rate).div(2),
          },
        });
      } else {
        await prisma.rendimentoDiario.create({
          data: {
            userId: investimento.userId,
            investimentoId: investimento.id,
            dateKey: hoje,
            base,
            rate,
            amount: rendimento,
          },
        });
      }

      await prisma.user.update({
        where: { id: investimento.userId },
        data: { saldo: { increment: rendimento } },
      });

      await prisma.investimento.update({
        where: { id: investimento.id },
        data: { rendimentoAcumulado: { increment: rendimento } },
      });
    } catch (err) {
      console.error(
        `❌ Erro ao atualizar investimento ${investimento.id} do usuário ${investimento.userId}:`,
        err
      );
    }
  }

  console.log("🏁 Rendimentos atualizados com sucesso!");
  await prisma.$disconnect();
}

// 🚀 Executa se for chamado via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  atualizarInvestimentos();
}
