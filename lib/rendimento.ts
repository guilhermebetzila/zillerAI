import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const TAXA_DIARIA = 0.015; // 1,5% ao dia

// Calcula o rendimento de UM usuário (com base no valorInvestido atual)
export async function calcularRendimentoUsuario(userId: number) {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { valorInvestido: true },
  });

  if (!usuario) return 0;

  const base = new Prisma.Decimal(usuario.valorInvestido || 0);
  if (base.lte(0)) return 0;

  return Number(base.mul(TAXA_DIARIA));
}

// Gera o rendimento do dia para TODOS, atualiza valorInvestido e grava histórico
export async function gerarRendimentoDiario() {
  const usuarios = await prisma.user.findMany({
    select: { id: true, valorInvestido: true },
  });

  const hoje = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const resultados: Array<{ userId: number; rendimento: number }> = [];

  for (const u of usuarios) {
    const base = new Prisma.Decimal(u.valorInvestido || 0);
    if (base.lte(0)) continue;

    const rendimento = base.mul(TAXA_DIARIA);

    // evita duplicar para o mesmo dia (chave única)
    const jaExiste = await prisma.rendimentoDiario.findUnique({
      where: { userId_dateKey: { userId: u.id, dateKey: hoje } },
    });
    if (jaExiste) continue;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: u.id },
        data: { valorInvestido: base.plus(rendimento) },
      }),
      prisma.rendimentoDiario.create({
        data: {
          userId: u.id,
          dateKey: hoje,
          base: base,
          rate: new Prisma.Decimal(TAXA_DIARIA),
          amount: rendimento,
        },
      }),
    ]);

    resultados.push({ userId: u.id, rendimento: Number(rendimento) });
  }

  return { message: "Rendimentos gerados com sucesso", resultados };
}
