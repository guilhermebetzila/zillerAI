import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import prisma from "@lib/prisma";

export async function GET() {
  try {
    // Pega a sessão do usuário
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca o usuário no banco pelo email
    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        saldo: true, // ✅ só pega o saldo por enquanto
      },
    });

    if (!usuario) {
      console.log("❌ Usuário não encontrado:", session.user.email);
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    console.log("✅ Saldo do usuário:", usuario.saldo);

    return NextResponse.json({
      saldo: Number(usuario.saldo) || 0,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar saldo do usuário:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
