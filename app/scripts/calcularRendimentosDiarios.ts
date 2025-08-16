import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function calcularRendimentosDiarios() {
  const hoje = new Date();
  const dateKey = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

  // Criar pasta de logs se não existir (⚠️ só funciona localmente, não na Vercel)
  const logPath = "./logs";
  if (!fs.existsSync(logPath)) fs.mkdirSync(logPath);

  const log = (msg: string) => {
    console.log(msg); // sempre loga no console (Vercel usa isso)
    fs.appendFileSync(`${logPath}/rendimentos.log`, msg + "\n");
  };

  log(`\n=== Execução: ${new Date()} ===`);

  try {
    // Buscar todos os investimentos
    const investimentos = await prisma.investimento.findMany();
    log(`Encontrados ${investimentos.length} investimentos.`);

    for (const investimento of investimentos) {
      // Converter Decimals para number
      const valor = investimento.valor instanceof Object ? investimento.valor.toNumber() : investimento.valor;
      const percentual = investimento.percentualDiario instanceof Object ? investimento.percentualDiario.toNumber() : investimento.percentualDiario;

      const lucro = valor * percentual;

      // Verificar se já existe rendimento para este usuário e data
      const existe = await prisma.rendimentoDiario.findFirst({
        where: {
          userId: investimento.userId,
          dateKey,
        },
      });

      if (!existe) {
        await prisma.rendimentoDiario.create({
          data: {
            userId: investimento.userId,
            dateKey,
            base: valor,
            rate: percentual,
            amount: lucro,
          },
        });

        log(`✅ Rendimento de R$ ${lucro.toFixed(2)} registrado para usuário ID ${investimento.userId}`);
      } else {
        log(`⚠️ Rendimento para usuário ID ${investimento.userId} e data ${dateKey} já existe. Pulando...`);
      }
    }

    log("✅ Cálculo e registro de rendimentos concluído!");
  } catch (error) {
    log(`❌ Erro ao calcular rendimentos: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
}

calcularRendimentosDiarios();
