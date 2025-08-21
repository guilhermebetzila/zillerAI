import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

// Tipo da resposta
export type IndicacoesQuantidadeResponse = {
  quantidade: number;
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Buscar usuário logado
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Contar quantos indicados diretos ele possui
    const quantidade: number = await prisma.user.count({
      where: { indicadoPorId: usuario.id },
    });

    const resposta: IndicacoesQuantidadeResponse = { quantidade };

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro API indicacoes/quantidade:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
