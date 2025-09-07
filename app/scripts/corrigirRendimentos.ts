import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function corrigirRendimentos() {
  const investimentos = await prisma.investimento.findMany({
    where: { ativo: true },
    include: { user: true },
  });

  for (const investimento of investimentos) {
    const rendimento = new Decimal(investimento.valor).mul(investimento.percentualDiario);

    // Atualiza o rendimento acumulado do investimento
    await prisma.investimento.update({
      where: { id: investimento.id },
      data: {
        rendimentoAcumulado: new Decimal(investimento.rendimentoAcumulado).plus(rendimento),
      },
    });

    // Atualiza o saldo e o residual do usuário
    await prisma.user.update({
      where: { id: investimento.userId },
      data: {
        saldo: new Decimal(investimento.user.saldo).plus(rendimento),
        bonusResidual: new Decimal(investimento.user.bonusResidual).plus(rendimento),
      },
    });
  }

  console.log("✅ Rendimentos corrigidos com sucesso!");
}

corrigirRendimentos()
  .catch((e) => {
    console.error("❌ Erro ao corrigir rendimentos:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
