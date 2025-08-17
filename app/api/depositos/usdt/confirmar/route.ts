// app/api/depositos/usdt/confirmar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as any;

    // Apenas admin pode confirmar
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem confirmar." },
        { status: 403 }
      );
    }

    const { txHash } = await req.json().catch(() => ({} as any));

    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json(
        { error: "Parâmetro inválido: txHash é obrigatório." },
        { status: 400 }
      );
    }

    // Busca depósito pelo hash
    const deposito = await prisma.onChainDeposit.findUnique({
      where: { txHash },
      include: { user: true },
    });

    if (!deposito) {
      return NextResponse.json(
        { error: "Depósito não encontrado para este txHash." },
        { status: 404 }
      );
    }

    if (deposito.status === "confirmado") {
      return NextResponse.json(
        { error: "Depósito já confirmado anteriormente." },
        { status: 400 }
      );
    }

    if (!deposito.userId) {
      return NextResponse.json(
        { error: "Depósito não está vinculado a nenhum usuário." },
        { status: 400 }
      );
    }

    // Atualiza status e credita saldo
    const updated = await prisma.$transaction(async (tx) => {
      await tx.onChainDeposit.update({
        where: { id: deposito.id },
        data: { status: "confirmado" },
      });

      await tx.user.update({
        where: { id: deposito.userId! },
        data: { saldo: { increment: deposito.amount } },
      });

      return deposito;
    });

    return NextResponse.json({
      ok: true,
      message: "Depósito confirmado e saldo creditado.",
      depositoId: deposito.id,
      userId: deposito.userId,
      valor: deposito.amount,
    });
  } catch (err) {
    console.error("❌ Erro ao confirmar depósito:", err);
    return NextResponse.json(
      { error: "Erro interno ao confirmar depósito." },
      { status: 500 }
    );
  }
}
