// app/scripts/atualizarInvestimentos.ts
import { prisma } from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";

// Configuração de logs
const LOG_PATH = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_PATH)) fs.mkdirSync(LOG_PATH, { recursive: true });
const LOG_FILE = path.join(LOG_PATH, "atualizarInvestimentos.log");
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "", { flag: "w" });

const log = (msg: string) => {
  console.log(msg);
  try {
    fs.appendFileSync(LOG_FILE, msg + "\n", { encoding: "utf8" });
  } catch (err) {
    console.error("❌ Falha ao escrever no log:", err);
  }
};

// Função principal
export async function atualizarInvestimentos() {
  const hoje = new Date().toISOString().split("T")[0];
  log(`\n=== Início da atualização: ${hoje} ===`);

  // Busca todos os investimentos ativos
  const investimentos = await prisma.investimento.findMany({
    where: { ativo: true },
    include: { user: true },
  });

  log(`🔹 Total de investimentos ativos encontrados: ${investimentos.length}`);

  for (const investimento of investimentos) {
    try {
      const base = new Decimal(investimento.valor);
      const rate = new Decimal(0.015); // fixo: 1.5% ao dia
      const rendimento = base.mul(rate);

      // Verifica se já foi registrado rendimento para esse investimento no dia
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
        log(
          `💡 Rendimento já registrado para investimento ${investimento.id}, usuário ${investimento.userId}`
        );
        continue;
      }

      // Cria registro do rendimento diário
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

      // Atualiza saldo do usuário
      await prisma.user.update({
        where: { id: investimento.userId },
        data: { saldo: new Decimal(investimento.user.saldo).add(rendimento) },
      });

      // Atualiza rendimento acumulado no investimento
      await prisma.investimento.update({
        where: { id: investimento.id },
        data: {
          rendimentoAcumulado: new Decimal(
            investimento.rendimentoAcumulado
          ).add(rendimento),
        },
      });

      log(
        `✅ Rendimento aplicado: ${rendimento.toFixed(
          2
        )} USDT para investimento ${investimento.id}, usuário ${investimento.userId}`
      );
    } catch (err) {
      log(
        `❌ Erro no investimento ${investimento.id} do usuário ${investimento.userId}: ${err}`
      );
    }
  }

  log("\n🏁 Atualização concluída!");
  await prisma.$disconnect();
}

// Permite rodar via CLI: `npm run atualizarInvestimentos`
if (process.argv[1].includes("atualizarInvestimentos")) {
  atualizarInvestimentos();
}
