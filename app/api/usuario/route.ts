import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";
import { Decimal } from "decimal.js";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 Verifica se o usuário está autenticado
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 🔍 Busca usuário completo no banco
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        nome: true,
        email: true,
        saldo: true,
        valorInvestido: true,
        bonusResidual: true,
        pontos: true,
        photoUrl: true,
        indicados: { select: { id: true } },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // 💰 Calcula o rendimento diário (1.5%)
    const valorInvestidoDecimal = new Decimal(usuario.valorInvestido || 0);
    const rendimentoDiario = valorInvestidoDecimal.mul(0.015).toNumber();

    // ✅ Retorna todos os dados formatados
    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      saldo: Number(usuario.saldo) || 0,
      valorInvestido: Number(usuario.valorInvestido) || 0,
      rendimentoDiario,
      bonusResidual: Number(usuario.bonusResidual) || 0,
      pontos: Number(usuario.pontos) || 0,
      totalIndicados: usuario.indicados.length,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
