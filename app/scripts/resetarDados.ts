import prisma from "../../lib/prisma";

async function resetarDados() {
  console.log("🚨 Resetando banco de dados: rendimentos, investimentos e saldos...");

  // 1. Apagar rendimentos
  await prisma.rendimentoDiario.deleteMany({});
  console.log("✅ Rendimentos apagados");

  // 2. Apagar investimentos
  await prisma.investimento.deleteMany({});
  console.log("✅ Investimentos apagados");

  // 3. Resetar saldos e valores investidos dos usuários
  await prisma.user.updateMany({
    data: {
      saldo: 0,
      valorInvestido: 0,
      bonusResidual: 0,
    },
  });
  console.log("✅ Saldos e valores dos usuários resetados");

  await prisma.$disconnect();
  console.log("🎉 Reset concluído com sucesso!");
}

// Permite rodar via CLI
if (process.argv[1].includes("resetarDados")) {
  resetarDados();
}
