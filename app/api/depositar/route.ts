import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma"; // ✅ usa a instância única

export async function GET(req: NextRequest) {
  try {
    // 🔑 Autenticação via token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 🔎 Busca usuário logado
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, email: true, carteira: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // 🔹 Depósitos Pix (internos)
    const pix = await prisma.deposito.findMany({
      where: { userId: user.id },
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        valor: true,
        criadoEm: true,
        status: true,
      },
    });

    // 🔹 On-chain confirmados (já vinculados ao usuário)
    const onchainConfirmados = await prisma.onChainDeposit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        txHash: true,
        from: true,
        to: true,
        amount: true,
        createdAt: true,
        status: true,
      },
    });

    // 🔹 On-chain pendentes (sem userId)
    const onchainPendentes = await prisma.onChainDeposit.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        txHash: true,
        from: true,
        to: true,
        amount: true,
        createdAt: true,
        status: true,
      },
    });

    return NextResponse.json({
      usuario: {
        id: user.id,
        email: user.email,
        carteira: user.carteira,
      },
      pix,
      onchainConfirmados,
      onchainPendentes,
    });
  } catch (error: any) {
    console.error("Erro no histórico de depósitos:", error);
    return NextResponse.json(
      { error: "Erro interno: " + (error.message || "desconhecido") },
      { status: 500 }
    );
  }
}
