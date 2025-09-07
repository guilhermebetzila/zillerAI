import prisma from "../../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

async function corrigirRendimentos() {
  console.log("=== Iniciando correção de rendimentos duplicados ===");

  const rendimentos = await prisma.rendimentoDiario.findMany({
    include: { investimento: true, user: true },
  });

  let corrigidos = 0;
  let ajustados = 0;

  // 🔑 Agrupar por userId + investimentoId + dateKey (ignorar creditedAt)
  const mapa = new Map<string, typeof rendimentos>();

  for (const r of rendimentos) {
    const chave = `${r.userId}-${r.investimentoId}-${r.dateKey.split("T")[0]}`;
    if (!mapa.has(chave)) mapa.set(chave, []);
    mapa.get(chave)!.push(r);
  }

  for (const [chave, lista] of mapa) {
    if (lista.length > 1) {
      // Se há duplicados no mesmo dia
      const investimento = lista[0].investimento;
      const user = lista[0].user;

      // Valor correto baseado no percentual do investimento
      const percentual = Number(investimento.percentualDiario) || 0.015; // fallback 1.5%
      const valorCorreto = new Decimal(investimento.valor).mul(percentual);

      // Soma de todos os rendimentos registrados
      const soma = lista.reduce((acc, r) => acc.add(r.amount), new Decimal(0));

      // Diferença que o usuário ganhou a mais
      const excesso = soma.sub(valorCorreto);

      if (excesso.gt(0)) {
        // Corrigir saldo do usuário
        await prisma.user.update({
          where: { id: user.id },
          data: { saldo: new Decimal(user.saldo).sub(excesso) },
        });
        ajustados++;
        console.log(
          `⚠️ Usuário ${user.id} recebeu a mais ${excesso.toFixed(
            2
          )}. Corrigido para ${valorCorreto.toFixed(2)}`
        );
      }

      // Manter só o primeiro registro, apagar os outros
      await prisma.rendimentoDiario.deleteMany({
        where: { id: { in: lista.slice(1).map((r) => r.id) } },
      });

      // Atualizar o registro que ficou com o valor correto
      await prisma.rendimentoDiario.update({
        where: { id: lista[0].id },
        data: { amount: valorCorreto },
      });

      corrigidos++;
    }
  }

  console.log(
    `\n✅ Correção concluída. Registros corrigidos: ${corrigidos}, saldos ajustados: ${ajustados}`
  );
  await prisma.$disconnect();
}

// Permite rodar direto: npx ts-node app/scripts/corrigirRendimentos.ts
if (process.argv[1].includes("corrigirRendimentos")) {
  corrigirRendimentos();
}
