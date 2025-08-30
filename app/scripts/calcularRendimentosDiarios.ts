import prisma from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";

const TAXA_DIARIA = new Decimal(0.025);
const BONUS_RESIDUAL_RATE = new Decimal(0.05);

export async function calcularRendimentosDiarios() {
  const hoje = new Date().toISOString().split("T")[0];

  const logPath = path.resolve(process.cwd(), "logs");
  if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);

  const logFile = path.join(logPath, "rendimentos.log");
  const log = (msg: string) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
  };

  log(`\n=== Execução: ${new Date()} ===`);

  try {
    const usuarios = await prisma.user.findMany({
      include: { investimentos: true, indicadoPor: true },
    });
    log(`🔹 Total de usuários encontrados: ${usuarios.length}`);

    for (const user of usuarios) {
      try {
        const totalInvestido = user.investimentos.reduce(
          (soma: Decimal, inv: typeof user.investimentos[number]) =>
            soma.add(inv.valor).add(inv.rendimentoAcumulado),
          new Decimal(0)
        );

        log(`\nUsuário ${user.id} - totalInvestido: ${totalInvestido.toFixed(2)}`);
        user.investimentos.forEach(inv => {
          log(`  Investimento ${inv.id}: valor=${inv.valor.toFixed(2)}, rendimentoAcumulado=${inv.rendimentoAcumulado.toFixed(2)}, ativo=${inv.ativo}`);
        });

        if (totalInvestido.lte(0)) {
          log("  ⏭ Ignorado (totalInvestido <= 0)");
          continue;
        }

        const rendimento = totalInvestido.mul(TAXA_DIARIA);
        log(`  Rendimento calculado: ${rendimento.toFixed(2)}`);

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
          log(`  Dummy criado com id ${dummy.id}`);
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
              rate: existente.rate.plus(TAXA_DIARIA).div(2),
            },
          });
          log(`  Rendimento diário atualizado no dummy ${dummy.id}`);
        } else {
          await prisma.rendimentoDiario.create({
            data: {
              userId: user.id,
              investimentoId: dummy.id,
              dateKey: hoje,
              base: totalInvestido,
              rate: TAXA_DIARIA,
              amount: rendimento,
            },
          });
          log(`  Rendimento diário criado no dummy ${dummy.id}`);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { saldo: user.saldo.add(rendimento) },
        });
        await prisma.investimento.update({
          where: { id: dummy.id },
          data: { rendimentoAcumulado: dummy.rendimentoAcumulado.add(rendimento) },
        });

        if (user.indicadoPorId) {
          const bonusResidual = rendimento.mul(BONUS_RESIDUAL_RATE);
          const indicadoPor = await prisma.user.findUnique({ where: { id: user.indicadoPorId } });
          if (indicadoPor) {
            await prisma.user.update({
              where: { id: indicadoPor.id },
              data: { saldo: indicadoPor.saldo.add(bonusResidual) },
            });
            log(`  💎 Bônus residual: Usuário ${indicadoPor.id} recebeu ${bonusResidual.toFixed(2)} USDT do indicado ${user.id}`);
          }
        }

        log(`  ✅ Processamento concluído para usuário ${user.id}`);
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

// Executa via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  calcularRendimentosDiarios();
}
