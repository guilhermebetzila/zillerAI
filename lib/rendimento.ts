import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library"; // <-- IMPORT CERTO

const TAXA_DIARIA = new Decimal(0.025); // exemplo: 2.5% ao dia

export async function gerarRendimentoDiario() {
  const usuarios = await prisma.user.findMany({
    select: { id: true, valorInvestido: true },
  });

  const hoje = new Date().toISOString().split("T")[0];
  const resultados: Array<{ userId: number; rendimento: number }> = [];

  for (const u of usuarios) {
    const base = new Decimal(u.valorInvestido || 0);
    if (base.lte(0)) continue;

    const rendimento = base.mul(TAXA_DIARIA);

    // Evita duplicar no mesmo dia
    const jaExiste = await prisma.rendimentoDiario.findUnique({
      where: { userId_dateKey: { userId: u.id, dateKey: hoje } },
    });
    if (jaExiste) continue;

    resultados.push({
      userId: u.id,
      rendimento: rendimento.toNumber(), // salva como number
    });
  }

  return resultados;
}
