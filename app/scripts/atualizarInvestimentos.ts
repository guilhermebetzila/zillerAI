// app/scripts/atualizarInvestimentos.ts
import { prisma } from "../../lib/prisma";

async function aplicarRendimentos() {
  try {
    const usuarios = await prisma.user.findMany({
      include: { investimentos: true },
    });

    await Promise.all(
      usuarios.map(async (usuario) => {
        let totalRendimento = 0;

        const saldoAtual =
          usuario.saldo instanceof Object
            ? usuario.saldo.toNumber()
            : usuario.saldo;

        // Processa investimentos
        const atualizacoes = usuario.investimentos.map(async (inv) => {
          if (!inv.ativo) return 0;

          const valor =
            inv.valor instanceof Object ? inv.valor.toNumber() : inv.valor;
          const rendimentoAcumulado =
            inv.rendimentoAcumulado instanceof Object
              ? inv.rendimentoAcumulado.toNumber()
              : inv.rendimentoAcumulado;
          const limite =
            inv.limite instanceof Object ? inv.limite.toNumber() : inv.limite;

          // Percentual diário
          let percentualDiario: number;
          if (valor <= 5000) {
            percentualDiario = 1.5;
          } else if (valor <= 10000) {
            percentualDiario = Number(
              (Math.random() * (1.8 - 1.6) + 1.6).toFixed(2)
            );
          } else {
            percentualDiario = Number(
              (Math.random() * (2.5 - 2.0) + 2.0).toFixed(2)
            );
          }

          const rendimento = valor * (percentualDiario / 100);
          let novoAcumulado = rendimentoAcumulado + rendimento;

          // Desativa investimento se atingir limite
          let ativo = true;
          if (novoAcumulado >= limite) {
            novoAcumulado = limite;
            ativo = false;
          }

          await prisma.investimento.update({
            where: { id: inv.id },
            data: {
              rendimentoAcumulado: novoAcumulado,
              ativo,
              // ⚠️ Não soma no valor do investimento → vai pro saldo
            },
          });

          return rendimento;
        });

        const rendimentos = await Promise.all(atualizacoes);
        totalRendimento = rendimentos.reduce((acc, val) => acc + val, 0);

        // Atualiza saldo do usuário
        if (totalRendimento > 0) {
          await prisma.user.update({
            where: { id: usuario.id },
            data: { saldo: saldoAtual + totalRendimento },
          });

          console.log(
            `💰 Rendimento total R$ ${totalRendimento.toFixed(
              2
            )} aplicado para usuário ${usuario.id}`
          );
        }
      })
    );

    console.log("✅ Rendimentos aplicados com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao aplicar rendimentos:", err);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa
aplicarRendimentos();
