import prisma from "../../lib/prisma";
import Decimal from "decimal.js";

async function aplicarRendimentos() {
  console.log("🚀 Aplicando 15 dias de rendimentos a 1.5% para todos os usuários...");

  const usuarios = await prisma.user.findMany();

  for (const user of usuarios) {
    const saldoAtual = new Decimal(user.saldo); // garante que é Decimal
    let saldoFinal = saldoAtual;

    for (let i = 0; i < 15; i++) {
      saldoFinal = saldoFinal.mul(new Decimal(1.015)); // multiplica por 1.015 = +1.5%
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { saldo: saldoFinal.toNumber() }, // converte para number antes de salvar
    });

    console.log(`✅ Usuário ${user.id} atualizado: ${saldoAtual.toFixed(2)} → ${saldoFinal.toFixed(2)}`);
  }

  console.log("🎉 Rendimentos aplicados com sucesso!");
  await prisma.$disconnect();
}

// Permite rodar via CLI
if (process.argv[1].includes("aplicarRendimentos15Dias")) {
  aplicarRendimentos();
}
