import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@/lib/prisma";
import { Decimal } from "decimal.js";

export async function GET() {
  try {
    // Obtém a sessão do usuário autenticado
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    // Busca os dados do usuário logado
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
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Converte valores numéricos para Decimal e calcula rendimento diário (1.5%)
    const valorInvestido = new Decimal(usuario.valorInvestido || 0);
    const rendimentoDiario = valorInvestido.mul(0.015); // 1.5% de rendimento

    // Monta a resposta formatada
    const dadosFormatados = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      saldo: Number(usuario.saldo) || 0,
      valorInvestido: Number(usuario.valorInvestido) || 0,
      rendimentoDiario: rendimentoDiario.toNumber(),
      bonusResidual: Number(usuario.bonusResidual) || 0,
      totalIndicados: usuario.indicados.length,
      pontos: Number(usuario.pontos) || 0,
      photoUrl: usuario.photoUrl || null,
    };

    return NextResponse.json(dadosFormatados, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
