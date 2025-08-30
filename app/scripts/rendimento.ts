import prisma from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";

const TAXA_DIARIA = new Decimal(0.025);

// Logs
const LOG_PATH = path.join(__dirname, "../../logs");
if (!fs.existsSync(LOG_PATH)) fs.mkdirSync(LOG_PATH, { recursive: true });

const LOG_FILE = path.join(LOG_PATH, "rendimentos.log");
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "", { flag: "w" });

const log = (msg: string) => {
  console.log(msg);
  try { fs.appendFileSync(LOG_FILE, msg + "\n"); } catch (err) { console.error("❌ Falha ao escrever no log:", err); }
};

export async function gerarRendimentoDiario() {
  const hoje = new Date().toISOString().split("T")[0];
  log(`\n=== Execução gerarRendimentoDiario: ${new Date()} ===`);

  try {
    const usuarios = await prisma.user.findMany({ include: { investimentos: true } });
    log(`🔹 Total de usuários: ${usuarios.length}`);

    for (const u of usuarios) {
      try {
        const totalInvestido = u.investimentos.reduce(
          (soma: Decimal, inv) => soma.add(inv.valor).add(inv.rendimentoAcumulado),
          new Decimal(0)
        );

        log(`\nUsuário ${u.id} - totalInvestido: ${totalInvestido.toFixed(2)}`);
        if (totalInvestido.lte(0)) {
          log("  ⏭ Ignorado (totalInvestido <= 0)");
          continue;
        }

        const rendimento = totalInvestido.mul(TAXA_DIARIA);

        let dummy = await prisma.investimento.findFirst({ where: { userId: u.id, ativo: false, limite: 0 } });
        if (!dummy) {
          dummy = await prisma.investimento.create({
            data: { userId: u.id, valor: new Decimal(0), ativo: false, percentualDiario: new Decimal(0), limite: new Decimal(0), rendimentoAcumulado: new Decimal(0) },
          });
          log(`  Dummy criado com id ${dummy.id}`);
        }

        const existente = await prisma.rendimentoDiario.findUnique({
          where: { userId_investimentoId_dateKey: { userId: u.id, investimentoId: dummy.id, dateKey: hoje } },
        });

        if (existente) {
          await prisma.rendimentoDiario.update({
            where: { id: existente.id },
            data: { amount: existente.amount.plus(rendimento), base: existente.base.plus(totalInvestido), rate: existente.rate.plus(TAXA_DIARIA).div(2) },
          });
          log(`  Rendimento diário atualizado no dummy ${dummy.id}`);
        } else {
          await prisma.rendimentoDiario.create({
            data: { userId: u.id, investimentoId: dummy.id, dateKey: hoje, base: totalInvestido, rate: TAXA_DIARIA, amount: rendimento },
          });
          log(`  Rendimento diário criado no dummy ${dummy.id}`);
        }

        await prisma.user.update({ where: { id: u.id }, data: { saldo: u.saldo.add(rendimento) } });
        await prisma.investimento.update({ where: { id: dummy.id }, data: { rendimentoAcumulado: dummy.rendimentoAcumulado.add(rendimento) } });

        log(`  ✅ Processamento concluído para usuário ${u.id}`);
      } catch (err) {
        log(`❌ Erro ao processar usuário ${u.id}: ${err}`);
      }
    }

    log("🏁 Rendimento diário processado com sucesso!");
  } catch (err) {
    log(`❌ Erro global: ${err}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  gerarRendimentoDiario();
}
