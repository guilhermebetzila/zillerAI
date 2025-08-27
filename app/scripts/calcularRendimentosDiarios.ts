// app/scripts/calcularRendimentosDiarios.ts
import { prisma } from "./prisma";
import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";

async function calcularRendimentosDiarios() {
  const hoje = new Date().toISOString().split("T")[0];
  const logPath = "./logs";
  if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);

  const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync(`${logPath}/rendimentos.log`, msg + "\n");
  };

  log(`\n=== Execução: ${new Date()} ===`);

  try {
    const usuarios = await prisma.user.findMany({
      include: { investimentos: true, indicadoPor: true }
    });
    log(`👤 Encontrados ${usuarios.length} usuários.`);

    for (const user of usuarios) {
      try {
        const totalInvestido = user.investimentos.reduce(
          (soma, inv) => soma.add(inv.valor).add(inv.rendimentoAcumulado),
          new Decimal(0)
        );

        if (totalInvestido.lte(0)) continue;

        const rate = new Decimal(0.025);
        const rendimento = totalInvestido.mul(rate);

        let dummy = await prisma.investimento.findFirst({
          where: { userId: user.id, ativo: false, limite: 0 },
        });

        if (!dummy) {
          dummy = await prisma.investimento.create({
            data: {
              userId: user.id,
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
              userId: user.id,
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
              rate: existente.rate.plus(rate).div(2),
            },
          });
        } else {
          await prisma.rendimentoDiario.create({
            data: {
              userId: user.id,
              investimentoId: dummy.id,
              dateKey: hoje,
              base: totalInvestido,
              rate,
              amount: rendimento,
            },
          });
        }

        // Adiciona rendimento ao saldo do usuário
        await prisma.user.update({
          where: { id: user.id },
          data: { saldo: { increment: rendimento } },
        });

        // Atualiza rendimento acumulado do investimento dummy
        await prisma.investimento.update({
          where: { id: dummy.id },
          data: { rendimentoAcumulado: dummy.rendimentoAcumulado.add(rendimento) },
        });

        // ------------------- Bônus residual -------------------
        if (user.indicadoPorId) {
          const bonusResidualRate = new Decimal(0.05); // 5%
          const bonusResidual = rendimento.mul(bonusResidualRate);

          await prisma.user.update({
            where: { id: user.indicadoPorId },
            data: { saldo: { increment: bonusResidual } },
          });

          log(
            `💎 Bonus residual: Usuário ${user.indicadoPorId} recebeu ${bonusResidual.toFixed(
              2
            )} USDT do rendimento do indicado ${user.id}`
          );
        }
      } catch (err) {
        log(`❌ Erro ao processar usuário ${user.id}: ${err}`);
      }
    }

    log("🏁 Cálculo concluído!");
  } catch (error) {
    log(`❌ Erro global: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

calcularRendimentosDiarios();
