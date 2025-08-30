import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // use alias do tsconfig
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions"; // use alias do tsconfig
import { Decimal } from "decimal.js";
import { Prisma } from "@prisma/client";

// POST: reinveste todo o saldo disponível do usuário
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = (session?.user as any)?.id;

    if (!userId) 
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      include: { investimentos: true },
    });

    if (!usuario) 
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Corrigido: comparar Decimal com 0
    if (new Decimal(usuario.saldo).lte(0)) 
      return NextResponse.json({ error: "Saldo insuficiente para reinvestir" }, { status: 400 });

    const valorReinvestir = new Decimal(usuario.saldo);

    // Transação para criar novo investimento e zerar saldo
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.investimento.create({
        data: {
          userId,
          valor: valorReinvestir.toNumber(),
          percentualDiario: new Decimal(0.025), // mesmo rendimento dos investimentos existentes
          rendimentoAcumulado: new Decimal(0),
          ativo: true,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { saldo: new Decimal(0) },
      });
    });

    return NextResponse.json({ 
      message: "Reinvestimento realizado com sucesso!", 
      valorReinvestir: valorReinvestir.toNumber() 
    });

  } catch (error) {
    console.error("Erro ao reinvestir saldo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
