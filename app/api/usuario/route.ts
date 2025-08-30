import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const rendimentoDiario = Number(usuario.valorInvestido) * 0.025;

    return NextResponse.json({
      saldo: usuario.saldo,
      valorInvestido: usuario.valorInvestido,
      rendimentoDiario,
      bonusResidual: usuario.bonusResidual,
      totalIndicados: usuario.indicados.length,
      pontos: usuario.pontos,
      photoUrl: usuario.photoUrl,
    });
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
