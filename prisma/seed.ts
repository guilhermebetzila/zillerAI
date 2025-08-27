import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco...");

  // ---- Usuários demo ----
  const senhaHash = await bcrypt.hash("123456", 10);

  const joao = await prisma.user.upsert({
    where: { email: "joao@email.com" },
    update: {},
    create: {
      nome: "João Silva",
      email: "joao@email.com",
      senha: senhaHash,
      saldo: 0,
      cpf: "11111111111",
    },
  });

  const ana = await prisma.user.upsert({
    where: { email: "ana@email.com" },
    update: {},
    create: {
      nome: "Ana Souza",
      email: "ana@email.com",
      senha: senhaHash,
      saldo: 0,
      cpf: "22222222222",
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: "maria@email.com" },
    update: {},
    create: {
      nome: "Maria Oliveira",
      email: "maria@email.com",
      senha: senhaHash,
      saldo: 0,
      cpf: "33333333333",
    },
  });

  await prisma.deposito.createMany({
    data: [
      { userId: joao.id, valor: 100, status: "confirmado" },
      { userId: joao.id, valor: 250, status: "pendente" },
      { userId: ana.id, valor: 75, status: "em_analise" },
      { userId: maria.id, valor: 300, status: "cancelado" },
    ],
  });

  // ---- Instrumentos demo ----
  const instruments = [
    { symbol: "WIN", venue: "B3_SIM", tickSize: 5.0 },     // Mini-índice B3
    { symbol: "WDO", venue: "B3_SIM", tickSize: 0.5 },     // Mini-dólar B3
    { symbol: "ES", venue: "ALPACA", tickSize: 0.25 },     // S&P 500 future (simulação)
    { symbol: "NQ", venue: "ALPACA", tickSize: 0.25 },     // Nasdaq future
    { symbol: "USDJPY", venue: "OANDA", tickSize: 0.001 }, // Forex par
  ];

  for (const inst of instruments) {
    await prisma.instrument.upsert({
      where: { symbol_venue: { symbol: inst.symbol, venue: inst.venue } },
      update: {},
      create: inst,
    });
  }

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
