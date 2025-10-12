import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";
import { Decimal } from "decimal.js";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        indicados: true,
        investimentos: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 🔹 Calcula valor total investido ativo
    const valorInvestidoTotal = usuario.investimentos
      .filter(inv => inv.ativo)
      .reduce((acc, inv) => acc.plus(inv.valor), new Decimal(0));

    // 🔹 Calcula rendimento diário total (soma dos investimentos ativos * percentualDiario)
    const rendimentoDiarioTotal = usuario.investimentos
      .filter(inv => inv.ativo)
      .reduce((acc, inv) => acc.plus(new Decimal(inv.valor).mul(inv.percentualDiario)), new Decimal(0));

    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      saldo: Number(usuario.saldo) || 0,
      valorInvestido: valorInvestidoTotal.toNumber(),
      rendimentoDiario: rendimentoDiarioTotal.toNumber(),
      bonusResidual: Number(usuario.bonusResidual) || 0,
      pontos: Number(usuario.pontos) || 0,
      totalIndicados: usuario.indicados.length,
      photoUrl: usuario.photoUrl || '',
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
