// app/scripts/atualizarInvestimentos.ts
import { prisma } from '../../lib/prisma';

async function aplicarRendimentos() {
  try {
    // Busca todos os usuários com seus investimentos
    const usuarios = await prisma.user.findMany({
      include: {
        investimentos: true,
      },
    });

    // Processa todos os usuários em paralelo
    await Promise.all(
      usuarios.map(async (usuario) => {
        let totalRendimento = 0;

        // Converter saldo Decimal para number
        const saldoAtual =
          usuario.saldo instanceof Object
            ? usuario.saldo.toNumber()
            : usuario.saldo;

        // Processa todos os investimentos do usuário
        const atualizacoesInvestimentos = usuario.investimentos.map(async (inv) => {
          if (!inv.ativo) return 0;

          // Converter valores Decimal para number
          const valor =
            inv.valor instanceof Object ? inv.valor.toNumber() : inv.valor;
          const rendimentoAcumulado =
            inv.rendimentoAcumulado instanceof Object
              ? inv.rendimentoAcumulado.toNumber()
              : inv.rendimentoAcumulado;
          const limite =
            inv.limite instanceof Object ? inv.limite.toNumber() : inv.limite;

          // Percentual diário variável por faixa
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
            },
          });

          return rendimento;
        });

        const rendimentos = await Promise.all(atualizacoesInvestimentos);
        totalRendimento = rendimentos.reduce((acc, val) => acc + val, 0);

        if (totalRendimento > 0) {
          await prisma.user.update({
            where: { id: usuario.id },
            data: {
              saldo: saldoAtual + totalRendimento,
            },
          });

          const totalRendimentoFormatado = isNaN(totalRendimento)
            ? "0.00"
            : totalRendimento.toFixed(2);

          console.log(
            `Rendimento total de R$ ${totalRendimentoFormatado} aplicado para o usuário ${usuario.id}`
          );
        }
      })
    );

    console.log('✅ Rendimentos aplicados com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao aplicar rendimentos:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// Executa a função
aplicarRendimentos();
