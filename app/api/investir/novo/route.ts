// app/api/investir/novo/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // 🔒 Verifica sessão
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // 📥 Lê body
    const { valor } = await req.json();
    const valorNumber = Number(valor);

    if (isNaN(valorNumber) || valorNumber <= 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    const valorDecimal = new Prisma.Decimal(valorNumber);

    // 🔎 Busca usuário
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const saldoAtual = usuario.saldo ?? new Prisma.Decimal(0);
    const valorInvestidoAtual = usuario.valorInvestido ?? new Prisma.Decimal(0);

    // ❌ Verifica saldo
    if (saldoAtual.lessThan(valorDecimal)) {
      return NextResponse.json(
        {
          error: "Saldo insuficiente.",
          saldoDisponivel: saldoAtual.toString(),
        },
        { status: 400 }
      );
    }

    // 💸 Cria investimento e atualiza saldo + valorInvestido em transação
    const investimento = await prisma.$transaction(async (tx) => {
      const novoInvestimento = await tx.investimento.create({
        data: {
          valor: valorDecimal,
          userId: usuario.id,
        },
      });

      await tx.user.update({
        where: { id: usuario.id },
        data: {
          saldo: saldoAtual.minus(valorDecimal),
          valorInvestido: valorInvestidoAtual.plus(valorDecimal),
        },
      });

      return novoInvestimento;
    });

    return NextResponse.json(
      {
        message: "✅ Investimento realizado com sucesso!",
        investimento: {
          ...investimento,
          valor: investimento.valor.toString(), // 🔄 Converte Decimal → string
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erro em /api/investir/novo:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
