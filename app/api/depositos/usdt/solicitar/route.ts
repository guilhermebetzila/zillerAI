// app/api/depositos/usdt/solicitar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const MAIN_WALLET = (process.env.MAIN_WALLET || "").toLowerCase();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id || null;

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const { valor } = await req.json().catch(() => ({} as any));
    if (!valor || typeof valor !== "number" || valor <= 0) {
      return NextResponse.json(
        { error: "Parâmetro inválido: 'valor' deve ser número > 0." },
        { status: 400 }
      );
    }

    if (!MAIN_WALLET) {
      return NextResponse.json(
        { error: "Carteira principal (MAIN_WALLET) não configurada." },
        { status: 500 }
      );
    }

    // Cria um registro de solicitação de depósito
    const deposito = await prisma.deposito.create({
      data: {
        userId: currentUserId,
        valor: valor.toString(),
        status: "aguardando", // ainda não creditado
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Depósito solicitado com sucesso. Envie USDT para a carteira.",
      depositoId: deposito.id,
      valor,
      carteiraDestino: MAIN_WALLET,
    });
  } catch (err) {
    console.error("❌ Erro em solicitar depósito USDT:", err);
    return NextResponse.json(
      { error: "Erro interno ao solicitar depósito." },
      { status: 500 }
    );
  }
}
