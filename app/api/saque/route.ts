// app/api/saques/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, amount, pixKey, description } = await req.json();

    if (!userId || !amount || !pixKey) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { saldo: true },
    });
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const valor = Number(amount);
    if (isNaN(valor) || valor <= 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    // regra de negócio: checar saldo disponível
    if (Number(usuario.saldo) < valor) {
      return NextResponse.json({ error: "Saldo insuficiente." }, { status: 400 });
    }

    // cria pedido (status PENDING)
    const saque = await prisma.withdrawalRequest.create({
      data: {
        userId: Number(userId),
        amount: valor,
        pixKey: String(pixKey),
        description: description ?? null,
        status: "PENDING",
        idEnvio: undefined, // será preenchido no processamento
      },
    });

    return NextResponse.json(saque, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar pedido de saque:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
