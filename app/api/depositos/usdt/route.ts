import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// endereço fixo da carteira da sua plataforma
const RECEIVING_WALLET = process.env.USDT_WALLET_ADDRESS || "0xSuaCarteiraAqui";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { valor } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // cria o registro do depósito pendente
    const deposito = await prisma.onChainDeposit.create({
      data: {
        from: "", // vamos preencher depois quando a txHash chegar
        to: RECEIVING_WALLET,
        amount: valor,
        status: "pendente",
        userId: user.id,
        txHash: "aguardando", // placeholder até confirmar
      },
    });

    return NextResponse.json({
      depositoId: deposito.id,
      carteiraDestino: RECEIVING_WALLET,
      valor: valor,
      mensagem: "Envie o valor para a carteira e aguarde a confirmação",
    });
  } catch (error) {
    console.error("Erro ao criar depósito USDT:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
