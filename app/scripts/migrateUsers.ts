import { localPrisma, remotePrisma } from "./clients";
import { Investimento, RendimentoDiario, User } from "@prisma/client";

async function migrate() {
  try {
    const users = await localPrisma.user.findMany({
      include: {
        investimentos: true,
        rendimentos: true,
        indicados: true,
      },
    });

    for (const user of users) {
      await remotePrisma.user.create({
        data: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          senha: user.senha,
          saldo: user.saldo,
          valorInvestido: user.valorInvestido,
          cpf: user.cpf || "00000000000",
          pontos: user.pontos,
          lastLogin: user.lastLogin,
          carteira: user.carteira,

          investimentos: {
            create: user.investimentos.map((inv: Investimento) => ({
              id: inv.id,
              valor: inv.valor,
              criadoEm: inv.criadoEm,
              percentualDiario: inv.percentualDiario,
              rendimentoAcumulado: inv.rendimentoAcumulado,
              ativo: inv.ativo,
              limite: inv.limite,
            })),
          },

          rendimentos: {
            create: user.rendimentos.map((rend: RendimentoDiario) => ({
              id: rend.id,
              dateKey: rend.dateKey,
              base: rend.base,
              rate: rend.rate,
              amount: rend.amount,
              createdAt: rend.createdAt,

              // ✅ Campos obrigatórios no schema
              userId: rend.userId,
              investimentoId: rend.investimentoId,
            })),
          },

          indicados: {
            create: user.indicados.map((ind: User) => ({
              id: ind.id,
              nome: ind.nome,
              email: ind.email,
              senha: ind.senha,
              saldo: ind.saldo,
              valorInvestido: ind.valorInvestido,
              cpf: ind.cpf || "00000000000",
              pontos: ind.pontos,
              lastLogin: ind.lastLogin,
              carteira: ind.carteira,
            })),
          },
        },
      });
    }

    console.log("✅ Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro na migração:", error);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

migrate();
