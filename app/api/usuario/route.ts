import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";
import { Decimal } from "decimal.js";

/**
 * Endpoint: /api/usuario
 * Retorna dados completos do usuário logado + rendimento diário.
 */
export async function GET() {
  try {
    // 🔒 Obtém a sessão do usuário logado
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado. Faça login para continuar." },
        { status: 401 }
      );
    }

    // 🔍 Busca o usuário no banco de dados
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
        indicados: {
          select: { id: true },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado no banco de dados." },
        { status: 404 }
      );
    }

    // 💰 Cálculo do rendimento diário: 1.5% do valor investido
    const valorInvestidoDecimal = new Decimal(usuario.valorInvestido || 0);
    const rendimentoDiario = valorInvestidoDecimal.mul(0.015).toNumber();

    // 🧾 Retorno padronizado
    return NextResponse.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      saldo: Number(usuario.saldo) || 0,
      valorInvestido: Number(usuario.valorInvestido) || 0,
      rendimentoDiario,
      bonusResidual: Number(usuario.bonusResidual) || 0,
      totalIndicados: usuario.indicados.length,
      pontos: Number(usuario.pontos) || 0,
      photoUrl: usuario.photoUrl || null,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
