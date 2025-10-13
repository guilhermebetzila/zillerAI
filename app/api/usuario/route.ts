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
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 🟩 Total investido em investimentos ativos
    const { _sum: sumInvestimentos } = await prisma.investimento.aggregate({
      _sum: { valor: true },
      where: { userId: usuario.id, ativo: true },
    });

    // 🟨 Total de rendimento diário
    const { _sum: sumRendimentos } = await prisma.rendimentoDiario.aggregate({
      _sum: { amount: true },
      where: { userId: usuario.id },
    });

    // 🔢 Converte e evita valores nulos
    const saldo = Number(usuario.saldo) || 0;
    const valorInvestido = Number(sumInvestimentos?.valor) || 0;
    const rendimentoDiario = Number(sumRendimentos?.amount) || 0;

    console.log("✅ Dados do usuário:", { saldo, valorInvestido, rendimentoDiario });

    // 🚀 Retorna os dados para o dashboard
    return NextResponse.json({
      saldo,
      valorInvestido,      // ✅ Total investido agora incluso
      rendimentoDiario,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
