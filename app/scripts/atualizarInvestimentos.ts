import { prisma } from "../../lib/prisma";
import dayjs from "dayjs"; // para formatação da data

async function aplicarRendimentos() {
  const hoje = dayjs().format("YYYY-MM-DD");

  const usuarios = await prisma.user.findMany({
    include: { investimentos: true },
  });

  await Promise.all(
    usuarios.map(async (usuario) => {
      let totalRendimento = 0;

      for (const inv of usuario.investimentos) {
        if (!inv.ativo) continue;

        // Verifica se já aplicou hoje
        const jaRodouHoje = await prisma.rendimentoDiario.findUnique({
          where: {
            // Usando o índice único composto (userId, investimentoId, dateKey)
            userId_investimentoId_dateKey: {
              userId: usuario.id,
              investimentoId: inv.id,
              dateKey: hoje,
            },
          },
        });
        if (jaRodouHoje) continue;

        const valor = Number(inv.valor);
        const limite = Number(inv.limite);
        const rendimentoAcumulado = Number(inv.rendimentoAcumulado);

        // Percentual diário
        let percentualDiario: number;
        if (valor <= 5000) percentualDiario = 1.5;
        else if (valor <= 10000)
          percentualDiario = Number((Math.random() * (1.8 - 1.6) + 1.6).toFixed(2));
        else
          percentualDiario = Number((Math.random() * (2.5 - 2.0) + 2.0).toFixed(2));

        const rendimento = valor * (percentualDiario / 100);
        let novoAcumulado = rendimentoAcumulado + rendimento;

        let ativo = true;
        if (limite > 0 && novoAcumulado >= limite) {
          novoAcumulado = limite;
          ativo = false;
        }

        // Atualiza investimento
        await prisma.investimento.update({
          where: { id: inv.id },
          data: { rendimentoAcumulado: novoAcumulado, ativo },
        });

        // Registra rendimento diário
        await prisma.rendimentoDiario.create({
          data: {
            userId: usuario.id,
            investimentoId: inv.id,
            dateKey: hoje,
            base: valor,
            rate: percentualDiario,
            amount: rendimento,
          },
        });

        totalRendimento += rendimento;
      }

      // Atualiza saldo do usuário
      if (totalRendimento > 0) {
        await prisma.user.update({
          where: { id: usuario.id },
          data: { saldo: Number(usuario.saldo) + totalRendimento },
        });

        console.log(
          `💰 R$ ${totalRendimento.toFixed(2)} aplicados ao usuário ${usuario.id}`
        );
      }
    })
  );

  console.log("✅ Rendimentos aplicados com sucesso!");
  await prisma.$disconnect();
}

// Executa o script
aplicarRendimentos();
