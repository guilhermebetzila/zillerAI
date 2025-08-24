import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Record<string, string> } // 👈 aqui está o ajuste
) {
  try {
    const body = await req.json();
    const id = context.params.id; // 👈 continua igual

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
