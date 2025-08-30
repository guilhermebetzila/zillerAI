// app/scripts/atualizarInvestimentos.ts
import prisma from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function atualizarInvestimentos() {
  const hoje = new Date().toISOString().split("T")[0];

  console.log(`\n=== Início da atualização: ${hoje} ===`);

  const investimentos = await prisma.investimento.findMany({
    where: { ativo: true },
    include: { user: true },
  });

  console.log(`🔹 Total de investimentos ativos encontrados: ${investimentos.length}`);

  for (const investimento of investimentos) {
    try {
      const base = new Decimal(investimento.valor);
      const rate = new Decimal(investimento.percentualDiario);
      const rendimento = base.mul(rate);

      console.log(`\nInvestimento ${investimento.id} do usuário ${investimento.userId}`);
      console.log(`Valor: ${base.toFixed(2)}, Taxa diária: ${rate.toFixed(4)}, Rendimento: ${rendimento.toFixed(2)}`);

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
        console.log("Atualizando registro de rendimento existente");
        await prisma.rendimentoDiario.update({
          where: { id: existente.id },
          data: {
            amount: existente.amount.plus(rendimento),
            base: existente.base.plus(base),
            rate: existente.rate.plus(rate).div(2),
          },
        });
      } else {
        console.log("Criando novo registro de rendimento diário");
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
        data: { saldo: investimento.user.saldo.add(rendimento) },
      });

      await prisma.investimento.update({
        where: { id: investimento.id },
        data: { rendimentoAcumulado: investimento.rendimentoAcumulado.add(rendimento) },
      });

      console.log(`✅ Atualização concluída para o investimento ${investimento.id}`);
    } catch (err) {
      console.error(`❌ Erro ao atualizar investimento ${investimento.id} do usuário ${investimento.userId}:`, err);
    }
  }

  console.log("\n🏁 Rendimentos atualizados com sucesso!");
  await prisma.$disconnect();
}

// 🚀 Executa se for chamado via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  atualizarInvestimentos();
}
