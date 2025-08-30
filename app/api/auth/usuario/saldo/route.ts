import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // agora funciona
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth"; // agora funciona

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true, valorInvestido: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      saldo: usuario.saldo,
      valorInvestido: usuario.valorInvestido || 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar saldo" },
      { status: 500 }
    );
  }
}
