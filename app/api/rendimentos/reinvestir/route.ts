import { NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import { Decimal } from "decimal.js";

export async function POST() {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const userId = (session?.user as any)?.id;

    if (!userId) return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });

    const usuario = await prisma.user.findUnique({ where: { id: userId }, include: { investimentos: true } });
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const saldo = new Decimal(usuario.saldo);
    if (saldo.lte(0)) return NextResponse.json({ error: "Saldo insuficiente para reinvestir" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.investimento.create({
        data: { userId, valor: saldo.toNumber(), percentualDiario: new Decimal(0.025), rendimentoAcumulado: new Decimal(0), ativo: true },
      });

      await tx.user.update({ where: { id: userId }, data: { saldo: new Decimal(0) } });
    });

    return NextResponse.json({ message: "Reinvestimento realizado com sucesso!", valorReinvestir: saldo.toNumber() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
