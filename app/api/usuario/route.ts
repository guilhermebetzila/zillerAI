import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";

export async function GET() {
  try {
    // Pega a sessão do usuário logado
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca o usuário no banco pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        saldo: true,
      },
    });

    if (!usuario) {
      console.log("❌ Usuário não encontrado:", session.user.email);
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 🟩 Busca o total investido pelo usuário
    const totalInvestido = await prisma.investimentos.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId: usuario.id,
      },
    });

    // 🟨 Busca o total de rendimento diário do usuário
    const totalRendimentoDiario = await prisma.rendimentos_diarios.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId: usuario.id,
      },
    });

    // Converte os valores para número e garante que não sejam nulos
    const saldo = Number(usuario.saldo) || 0;
    const investido = Number(totalInvestido._sum.valor) || 0;
    const rendimentoDiario = Number(totalRendimentoDiario._sum.valor) || 0;

    console.log("✅ Dados do usuário:", { saldo, investido, rendimentoDiario });

    // Retorna os dados
    return NextResponse.json({
      saldo,
      investido,
      rendimentoDiario,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
