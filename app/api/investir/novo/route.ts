// app/api/investir/novo/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // ✅ caminho corrigido
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions"; // ✅ caminho corrigido
import Decimal from "decimal.js";
import type { Prisma } from "@prisma/client";

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

    const valorDecimal = new Decimal(valorNumber);

    // 🔎 Busca usuário
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const saldoAtual = new Decimal(usuario.saldo ?? 0);
    const valorInvestidoAtual = new Decimal(usuario.valorInvestido ?? 0);

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
    const investimento = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const novoInvestimento = await tx.investimento.create({
        data: {
          valor: valorDecimal.toNumber(),
          userId: usuario.id,
        },
      });

      await tx.user.update({
        where: { id: usuario.id },
        data: {
          saldo: saldoAtual.minus(valorDecimal).toNumber(),
          valorInvestido: valorInvestidoAtual.plus(valorDecimal).toNumber(),
        },
      });

      return novoInvestimento;
    });

    return NextResponse.json(
      {
        message: "✅ Investimento realizado com sucesso!",
        investimento: {
          ...investimento,
          valor: new Decimal(investimento.valor ?? 0).toString(), // converte para string
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erro em /api/investir/novo:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
