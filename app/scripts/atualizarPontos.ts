import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🔁 Função recursiva para calcular todos os descendentes de um usuário
async function calcularIndicadosRecursivo(userId: number): Promise<number> {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    include: { indicados: true },
  });

  if (!usuario) return 0;

  let total = usuario.indicados.length; // conta diretos
  for (const ind of usuario.indicados) {
    total += await calcularIndicadosRecursivo(ind.id); // soma todos os indiretos
  }

  return total;
}

async function atualizarPontos() {
  try {
    const usuarios = await prisma.user.findMany();

    for (const usuario of usuarios) {
      // 1️⃣ Buscar investimentos próprios
      const investimentosProprios = await prisma.investimento.findMany({
        where: { userId: usuario.id },
      });

      const totalInvestidoProprio = investimentosProprios.reduce(
        (acc, i) => acc + (i.valor instanceof Object ? i.valor.toNumber() : i.valor),
        0
      );

      // 2️⃣ Buscar investimentos dos indicados diretos
      const indicadosDiretos = await prisma.user.findMany({
        where: { indicadoPorId: usuario.id },
        include: { indicados: true },
      });

      let totalInvestidoIndicados = 0;
      for (const indicado of indicadosDiretos) {
        const inv = await prisma.investimento.findMany({
          where: { userId: indicado.id },
        });

        totalInvestidoIndicados += inv.reduce(
          (acc, i) => acc + (i.valor instanceof Object ? i.valor.toNumber() : i.valor),
          0
        );
      }

      // 3️⃣ Somar total de investimentos próprios + dos indicados
      const totalInvestido = totalInvestidoProprio + totalInvestidoIndicados;

      // 4️⃣ Calcular pontos por investimento (1 ponto a cada R$2)
      const pontosPorInvestimento = Math.floor(totalInvestido / 2);

      // 5️⃣ Calcular pontos por indicação (5 por cada direto + indireto recursivo)
      const totalIndicados = await calcularIndicadosRecursivo(usuario.id);
      const pontosPorIndicacao = totalIndicados * 5;

      // 6️⃣ Total de pontos = investimento + indicação
      const pontos = pontosPorInvestimento + pontosPorIndicacao;

      // 7️⃣ Atualizar pontos do usuário
      await prisma.user.update({
        where: { id: usuario.id },
        data: { pontos },
      });

      console.log(
        `Usuário ID ${usuario.id} atualizado com ${pontos} pontos (Investimento: ${pontosPorInvestimento}, Indicação: ${pontosPorIndicacao}, Total de indicados: ${totalIndicados}).`
      );
    }

    console.log("✅ Atualização de pontos concluída!");
  } catch (error) {
    console.error("❌ Erro ao atualizar pontos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarPontos();
