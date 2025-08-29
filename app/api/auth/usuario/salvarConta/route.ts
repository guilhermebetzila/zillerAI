import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // ✅ conferindo alias certo

export async function POST(req: Request) {
  try {
    const { userId, pixKey, carteira } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário não informado" },
        { status: 400 }
      );
    }

    const usuario = await prisma.user.update({
      where: { id: Number(userId) }, // garante número
      data: {
        pixKey: pixKey || null,
        carteira: carteira || null,
      },
    });

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error("❌ Erro ao salvar conta:", error.message);
    return NextResponse.json(
      { error: "Erro ao salvar dados", details: error.message },
      { status: 500 }
    );
  }
}
