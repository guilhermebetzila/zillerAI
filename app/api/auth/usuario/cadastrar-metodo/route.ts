// app/api/auth/usuario/cadastrar-metodo/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { metodo, valor } = body;

    if (!metodo || !valor) {
      return NextResponse.json(
        { error: "Método ou valor inválido" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (metodo === "pix") updateData.chavePix = valor;
    if (metodo === "usdt") updateData.carteiraUsdt = valor;

    await prisma.user.update({
      where: { id: Number(session.user.id) }, // <-- conversão para number
      data: updateData,
    });

    return NextResponse.json({
      message: `${metodo.toUpperCase()} cadastrado com sucesso!`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao cadastrar método" },
      { status: 500 }
    );
  }
}
