import prisma from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_PATH)) fs.mkdirSync(LOG_PATH, { recursive: true });
const LOG_FILE = path.join(LOG_PATH, "calcularRendimentosDiarios.log");
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "", { flag: "w" });

const log = (msg: string) => {
  console.log(msg);
  try {
    fs.appendFileSync(LOG_FILE, msg + "\n", { encoding: "utf8" });
  } catch (err) {
    console.error("❌ Falha ao escrever no log:", err);
  }
};

export async function calcularRendimentosDiarios() {
  const hoje = new Date().toISOString().split("T")[0];
  log(`\n=== Calculando rendimentos do dia: ${hoje} ===`);

  const investimentos = await prisma.investimento.findMany({
    where: { ativo: true },
    include: { user: true },
  });

  for (const investimento of investimentos) {
    try {
      const rate = new Decimal(0.015); // 1.5%
      const base = new Decimal(investimento.valor);
      const rendimento = base.mul(rate);

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

      log(`✅ Rendimento calculado para investimento ${investimento.id}: ${rendimento.toFixed(2)}`);
    } catch (err) {
      log(`❌ Erro ao calcular rendimento do investimento ${investimento.id}: ${err}`);
    }
  }

  await prisma.$disconnect();
  log("\n🏁 Cálculo de rendimentos diário concluído!");
}

if (process.argv[1].includes("calcularRendimentosDiarios")) {
  calcularRendimentosDiarios();
}
