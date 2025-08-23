import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusSaque } from "@prisma/client"; // enum do prisma

export async function POST(req: Request) {
  try {
    const { userId, valor, metodo, chavePix, carteiraUsdt } = await req.json();

    if (!userId || !valor || !metodo) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { saldo: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    if (Number(usuario.saldo) < valorNum) {
      return NextResponse.json({ error: "Saldo insuficiente." }, { status: 400 });
    }

    const saque = await prisma.saque.create({
      data: {
        userId: Number(userId),
        valor: valorNum,
        tipo: metodo,
        chavePix: metodo === "PIX" ? chavePix : null,
        txHash: metodo === "USDT" ? carteiraUsdt : null,
        status: StatusSaque.pendente,
      },
    });

    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        saldo: Number(usuario.saldo) - valorNum,
      },
    });

    return NextResponse.json(saque, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar pedido de saque:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
