import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";
import { Decimal } from "decimal.js";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

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
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Cálculo do rendimento diário com 1.5% do valor investido
    const valorInvestidoDecimal = new Decimal(usuario.valorInvestido || 0);
    const rendimentoDiario = valorInvestidoDecimal.mul(0.015).toNumber();

    return NextResponse.json({
      saldo: Number(usuario.saldo) || 0,
      valorInvestido: Number(usuario.valorInvestido) || 0,
      rendimentoDiario,
      bonusResidual: Number(usuario.bonusResidual) || 0,
      totalIndicados: usuario.indicados.length,
      pontos: Number(usuario.pontos) || 0,
      photoUrl: usuario.photoUrl || null,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
