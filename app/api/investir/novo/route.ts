// app/api/investir/novo/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(req: Request) {
  try {
    // 🔒 Verifica sessão
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // 📥 Lê body
    const { valor } = await req.json();

    if (!valor || isNaN(valor) || Number(valor) <= 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    // 🔎 Busca usuário
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // ❌ Verifica saldo
    if (Number(usuario.saldo) < Number(valor)) {
      return NextResponse.json({ error: "Saldo insuficiente." }, { status: 400 });
    }

    // 💸 Cria investimento e atualiza saldo + valorInvestido em transação
    const investimento = await prisma.$transaction(async (tx) => {
      // Cria o investimento
      const novoInvestimento = await tx.investimento.create({
        data: {
          valor,
          userId: usuario.id,
        },
      });

      // Atualiza saldo e valorInvestido
      await tx.user.update({
        where: { id: usuario.id },
        data: {
          saldo: usuario.saldo.minus(valor),
          valorInvestido: usuario.valorInvestido.plus(valor),
        },
      });

      return novoInvestimento;
    });

    return NextResponse.json(
      { message: "✅ Investimento realizado com sucesso!", investimento },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erro em /api/investir/novo:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
