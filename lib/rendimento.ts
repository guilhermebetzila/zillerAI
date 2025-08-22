import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// 🔹 Função para calcular o rendimento diário de UM usuário
export async function calcularRendimentoUsuario(userId: number) {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { valorInvestido: true },
  });

  if (!usuario) return 0;

  // Exemplo: 1,5% ao dia
  const taxaDiaria = 0.015;
  const rendimento = Number(usuario.valorInvestido) * taxaDiaria;

  return rendimento;
}

// 🔹 Função para gerar rendimentos diários para TODOS os usuários
export async function gerarRendimentoDiario() {
  const usuarios = await prisma.user.findMany({
    select: { id: true, valorInvestido: true },
  });

  const hoje = new Date().toISOString().split("T")[0]; // chave única para o dia

  for (const usuario of usuarios) {
    if (!usuario.valorInvestido || Number(usuario.valorInvestido) <= 0) continue;

    const rendimento = Number(usuario.valorInvestido) * 0.015; // 1,5% ao dia

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
      await prisma.rendimentoDiario.create({
        data: {
          userId: usuario.id,
          dateKey: hoje,
          base: new Prisma.Decimal(usuario.valorInvestido),
          rate: new Prisma.Decimal(0.015),
          amount: new Prisma.Decimal(rendimento),
        },
      });
    }
  }

  return { message: "Rendimentos gerados com sucesso" };
}
