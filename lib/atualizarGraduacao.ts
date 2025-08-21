// lib/atualizarGraduacao.ts
import { prisma } from "./prisma";

export async function atualizarGraduacao(userId: number) {
  if (!userId || isNaN(userId)) {
    console.warn("ID de usuário inválido:", userId);
    return;
  }

  // 🔎 Busca apenas os dados necessários do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, pontos: true, graduacaoId: true },
  });

  if (!user) {
    console.warn(`Usuário não encontrado: ${userId}`);
    return;
  }

  // 🔹 Busca todas as graduações ordenadas por pontos (maior → menor)
  const graduacoes = await prisma.graduacao.findMany({
    orderBy: { pontos: "desc" },
  });

  // Seleciona a maior graduação que o usuário atingiu
  const graduacaoAtual = graduacoes.find((g) => user.pontos >= g.pontos);
  if (!graduacaoAtual) {
    console.log(`Usuário ${user.id} não atingiu nenhuma graduação`);
    return;
  }

  // Atualiza a graduação do usuário se for diferente da atual
  if (user.graduacaoId !== graduacaoAtual.id) {
    await prisma.user.update({
      where: { id: user.id },
      data: { graduacaoId: graduacaoAtual.id },
    });
    console.log(
      `✅ Usuário ${user.id} atualizado para graduação ${graduacaoAtual.nome}`
    );
  }
}
