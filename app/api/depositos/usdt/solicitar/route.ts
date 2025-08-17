// app/api/depositos/usdt/solicitar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endereço fixo da carteira do sistema (vem do .env)
const USDT_WALLET = process.env.NEXT_PUBLIC_USDT_WALLET || "";

export async function POST(req: Request) {
  try {
    const { userId, valor } = await req.json();

    if (!userId || !valor) {
      return NextResponse.json(
        { error: "Parâmetros inválidos: userId e valor são obrigatórios." },
        { status: 400 }
      );
    }

    if (!USDT_WALLET) {
      return NextResponse.json(
        { error: "Carteira USDT não configurada no servidor." },
        { status: 500 }
      );
    }

    // Cria solicitação no banco (depósito aguardando pagamento)
    const deposito = await prisma.deposito.create({
      data: {
        userId,
        valor: valor.toString(), // Prisma Decimal espera string
        status: "pendente",
        metodo: "usdt",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Solicitação de depósito criada.",
      depositoId: deposito.id,
      valor,
      carteira: USDT_WALLET,
      observacao: "Envie exatamente esse valor para a carteira informada.",
    });
  } catch (err) {
    console.error("❌ Erro ao solicitar depósito:", err);
    return NextResponse.json(
      { error: "Erro interno ao solicitar depósito." },
      { status: 500 }
    );
  }
}
