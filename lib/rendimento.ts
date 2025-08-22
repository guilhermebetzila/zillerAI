import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Taxa fixa de rendimento diário
const TAXA_DIARIA = 0.015; // 1,5% ao dia

// 🔹 Função para calcular o rendimento diário de UM usuário
export async function calcularRendimentoUsuario(userId: number) {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { valorInvestido: true },
  });

  if (!usuario || Number(usuario.valorInvestido) <= 0) return 0;

  return Number(usuario.valorInvestido) * TAXA_DIARIA;
}

// 🔹 Função para gerar rendimentos diários para TODOS os usuários
export async function gerarRendimentoDiario() {
  const usuarios = await prisma.user.findMany({
    select: { id: true, valorInvestido: true },
  });

  const hoje = new Date().toISOString().split("T")[0]; // chave única para o dia

  const resultados: any[] = [];

  for (const usuario of usuarios) {
    if (!usuario.valorInvestido || Number(usuario.valorInvestido) <= 0) continue;

    const rendimento = Number(usuario.valorInvestido) * TAXA_DIARIA;

    // Evita inserir rendimento duplicado no mesmo dia
    const existente = await prisma.rendimentoDiario.findUnique({
      where: {
        userId_dateKey: {
          userId: usuario.id,
          dateKey: hoje,
        },
      },
    });

    if (!existente) {
      await prisma.$transaction([
        // Atualiza o valor investido do usuário (incrementa rendimento)
        prisma.user.update({
          where: { id: usuario.id },
          data: {
            valorInvestido: new Prisma.Decimal(usuario.valorInvestido).plus(
              rendimento
            ),
          },
        }),
        // Cria o registro de rendimento no histórico
        prisma.rendimentoDiario.create({
          data: {
            userId: usuario.id,
            dateKey: hoje,
            base: new Prisma.Decimal(usuario.valorInvestido),
            rate: new Prisma.Decimal(TAXA_DIARIA),
            amount: new Prisma.Decimal(rendimento),
          },
        }),
      ]);

      resultados.push({ userId: usuario.id, rendimento });
    }
  }

  return { message: "Rendimentos gerados com sucesso", resultados };
}
