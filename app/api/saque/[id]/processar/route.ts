import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // ✅ corrigido

export async function POST(
  req: NextRequest,
  { params }: { params: any }   // pode deixar `any` mesmo
) {
  try {
    const body = await req.json();
    const id = params.id; // pega o id da URL dinâmica

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
