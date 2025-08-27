import { prisma } from "./prisma.js";
import { Decimal } from "@prisma/client/runtime/library";

const TAXA_DIARIA = new Decimal(0.025);

export async function gerarRendimentoDiario() {
  const usuarios = await prisma.user.findMany({ include: { investimentos: true } });
  const hoje = new Date().toISOString().split("T")[0];

  for (const u of usuarios) {
    try {
      const totalInvestido = u.investimentos.reduce(
        (soma: Decimal, inv: typeof u.investimentos[number]) =>
          soma.add(inv.valor).add(inv.rendimentoAcumulado),
        new Decimal(0)
      );

      if (totalInvestido.lte(0)) continue;

      const rendimento = totalInvestido.mul(TAXA_DIARIA);

      let dummy = await prisma.investimento.findFirst({
        where: { userId: u.id, ativo: false, limite: 0 },
      });

      if (!dummy) {
        dummy = await prisma.investimento.create({
          data: {
            userId: u.id,
            valor: new Decimal(0),
            ativo: false,
            percentualDiario: new Decimal(0),
            limite: new Decimal(0),
            rendimentoAcumulado: new Decimal(0),
          },
        });
      }

      const existente = await prisma.rendimentoDiario.findUnique({
        where: {
          userId_investimentoId_dateKey: {
            userId: u.id,
            investimentoId: dummy.id,
            dateKey: hoje,
          },
        },
      });

      if (existente) {
        await prisma.rendimentoDiario.update({
          where: { id: existente.id },
          data: {
            amount: existente.amount.plus(rendimento),
            base: existente.base.plus(totalInvestido),
            rate: existente.rate.plus(TAXA_DIARIA).div(2),
          },
        });
      } else {
        await prisma.rendimentoDiario.create({
          data: {
            userId: u.id,
            investimentoId: dummy.id,
            dateKey: hoje,
            base: totalInvestido,
            rate: TAXA_DIARIA,
            amount: rendimento,
          },
        });
      }

      await prisma.user.update({
        where: { id: u.id },
        data: { saldo: u.saldo.add(rendimento) },
      });

      await prisma.investimento.update({
        where: { id: dummy.id },
        data: { rendimentoAcumulado: dummy.rendimentoAcumulado.add(rendimento) },
      });
    } catch (err) {
      console.error(`❌ Erro ao processar usuário ${u.id}:`, err);
    }
  }

  console.log("🏁 Rendimento diário processado com sucesso!");
  await prisma.$disconnect();
}

// 🚀 Executa se for chamado via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  gerarRendimentoDiario();
}
