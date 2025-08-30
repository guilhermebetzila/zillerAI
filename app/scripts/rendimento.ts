import prisma from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), "logs");
if (!fs.existsSync(LOG_PATH)) fs.mkdirSync(LOG_PATH, { recursive: true });
const LOG_FILE = path.join(LOG_PATH, "rendimento.log");
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "", { flag: "w" });

const log = (msg: string) => {
  console.log(msg);
  try {
    fs.appendFileSync(LOG_FILE, msg + "\n", { encoding: "utf8" });
  } catch (err) {
    console.error("❌ Falha ao escrever no log:", err);
  }
};

export async function gerarRendimento() {
  const hoje = new Date().toISOString().split("T")[0];
  log(`\n=== Gerando rendimentos no saldo: ${hoje} ===`);

  const rendimentos = await prisma.rendimentoDiario.findMany({
    where: { dateKey: hoje },
    include: { user: true, investimento: true },
  });

  for (const r of rendimentos) {
    try {
      await prisma.user.update({
        where: { id: r.userId },
        data: { saldo: new Decimal(r.user.saldo).plus(new Decimal(r.amount)) },
      });
      log(`✅ Rendimento aplicado ao usuário ${r.userId}: ${r.amount.toFixed(2)}`);
    } catch (err) {
      log(`❌ Erro ao aplicar rendimento do usuário ${r.userId}: ${err}`);
    }
  }

  await prisma.$disconnect();
  log("\n🏁 Rendimento diário aplicado com sucesso!");
}

if (process.argv[1].includes("rendimento")) {
  gerarRendimento();
}
