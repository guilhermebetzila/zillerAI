import prisma from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";

// Logs
const LOG_PATH = path.resolve("./logs");
if (!fs.existsSync(LOG_PATH)) fs.mkdirSync(LOG_PATH, { recursive: true });
const LOG_FILE = path.join(LOG_PATH, "rendimentos.log");
const log = (msg: string) => {
  console.log(msg);
  try { fs.appendFileSync(LOG_FILE, msg + "\n"); } catch (err) { console.error("❌ Falha ao escrever no log:", err); }
};

export async function atualizarInvestimentos() {
  const hoje = new Date().toISOString().split("T")[0];
  log(`\n=== Início da atualização: ${hoje} ===`);

  const investimentos = await prisma.investimento.findMany({
    where: { ativo: true },
    include: { user: true },
  });
  log(`🔹 Total de investimentos ativos encontrados: ${investimentos.length}`);

  for (const investimento of investimentos) {
    try {
      const base = new Decimal(investimento.valor);
      const rate = new Decimal(investimento.percentualDiario);
      const rendimento = base.mul(rate);

      log(`\nInvestimento ${investimento.id} do usuário ${investimento.userId}`);
      log(`Valor: ${base.toFixed(2)}, Taxa diária: ${rate.toFixed(4)}, Rendimento: ${rendimento.toFixed(2)}`);

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
        log("Atualizando registro de rendimento existente");
        await prisma.rendimentoDiario.update({
          where: { id: existente.id },
          data: {
            amount: existente.amount.plus(rendimento),
            base: existente.base.plus(base),
            rate: existente.rate.plus(rate).div(2),
          },
        });
      } else {
        log("Criando novo registro de rendimento diário");
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

      log(`✅ Atualização concluída para o investimento ${investimento.id}`);
    } catch (err) {
      log(`❌ Erro ao atualizar investimento ${investimento.id} do usuário ${investimento.userId}: ${err}`);
    }
  }

  log("\n🏁 Rendimentos atualizados com sucesso!");
  await prisma.$disconnect();
}

// Executa via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  atualizarInvestimentos();
}
