import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // pegar o id da URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").slice(-2, -1)[0]; // pega o [id]

    const body = await req.json();

    // exemplo: atualizar status do saque
    const saque = await prisma.saque.update({
      where: { id: Number(id) },
      data: { status: body.status },
    });

    return NextResponse.json(saque);
  } catch (error) {
    console.error("Erro no processar saque:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
