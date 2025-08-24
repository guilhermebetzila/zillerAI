import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  try {
    const body = await req.json();
    const id = context.params.id; // 👈 Pega o id daqui

    const saque = await prisma.saque.update({
      where: { id: Number(id) },
      data: { status: body.status },
    });

    return NextResponse.json(saque);
  } catch (error) {
    console.error("Erro ao processar saque:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
