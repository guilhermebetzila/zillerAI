import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";

export async function GET() {
  try {
    // 🔐 Pega a sessão do usuário logado
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 🔍 Busca o usuário no banco pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        saldo: true,
      },
    });

    if (!usuario) {
      console.log("❌ Usuário não encontrado:", session.user.email);
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // 🟩 Busca o total investido pelo usuário (tabela correta: Investimento)
    const totalInvestido = await prisma.investimento.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        userId: usuario.id,
        ativo: true, // só conta investimentos ativos
      },
    });

    // 🟨 Busca o total de rendimento diário (tabela correta: RendimentoDiario)
    const totalRendimentoDiario = await prisma.rendimentoDiario.aggregate({
      _sum: {
        amount: true, // campo correto no seu schema
      },
      where: {
        userId: usuario.id,
      },
    });

    // 🔢 Converte e evita valores nulos
    const saldo = Number(usuario.saldo) || 0;
    const investido = Number(totalInvestido._sum.valor) || 0;
    const rendimentoDiario = Number(totalRendimentoDiario._sum.amount) || 0;

    console.log("✅ Dados do usuário:", {
      saldo,
      investido,
      rendimentoDiario,
    });

    // 🚀 Retorna os dados
    return NextResponse.json({
      saldo,
      investido,
      rendimentoDiario,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
