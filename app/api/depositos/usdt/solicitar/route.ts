import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const MAIN_WALLET = (process.env.MAIN_WALLET || "").toLowerCase();

export async function POST(req: Request) {
  try {
    // 🔑 Pega usuário logado
    const session = await getServerSession(authOptions);
    const currentUserIdRaw = (session?.user as any)?.id || null;
    const currentUserId = currentUserIdRaw ? Number(currentUserIdRaw) : null;

    // 🔎 Logs para debug
    console.log("🔎 MAIN_WALLET:", MAIN_WALLET);
    console.log("🔎 SESSION:", session);
    console.log("🔎 currentUserId (raw):", currentUserIdRaw);
    console.log("🔎 currentUserId (number):", currentUserId);

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // 📥 Pega valor do body
    const { valor } = await req.json().catch(() => ({} as any));
    console.log("🔎 Valor recebido:", valor);

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

    // 💾 Cria registro de solicitação de depósito
    const deposito = await prisma.deposito.create({
      data: {
        userId: currentUserId, // ✅ Agora sempre é Int
        valor: Number(valor),  // garante número válido
        metodo: "usdt",
        status: "aguardando",
      },
    });

    console.log("✅ Depósito criado:", deposito);

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
