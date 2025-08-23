// app/api/reinvestir/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { valor } = await req.json();
    if (!valor || valor <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Buscar usuário logado
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const saldoAtual =
      typeof usuario.saldo === "object"
        ? (usuario.saldo as any).toNumber()
        : Number(usuario.saldo);

    if (saldoAtual < valor) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Transação: debitar saldo + criar investimento
    await prisma.$transaction([
      prisma.user.update({
        where: { id: usuario.id },
        data: { saldo: saldoAtual - valor },
      }),
      prisma.investimento.create({
        data: {
          userId: usuario.id,
          valor,
          rendimentoAcumulado: 0,
          limite: valor * 3, // Exemplo: limite de 3x
          ativo: true,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no reinvestir:", error);
    return NextResponse.json({ error: "Erro ao reinvestir" }, { status: 500 });
  }
}
