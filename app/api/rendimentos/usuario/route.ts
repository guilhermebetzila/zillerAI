import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    const session = await getServerSession(authOptions).catch(() => null);
    const sessionId = (session?.user as any)?.id;

    const userId = queryUserId ? Number(queryUserId) : Number(sessionId);
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Usuário não identificado" }, { status: 400 });
    }

    const ultimo = await prisma.rendimentoDiario.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }, // ⬅️ agora existe no schema
      select: { amount: true, dateKey: true, createdAt: true },
    });

    if (!ultimo) {
      return NextResponse.json({
        userId,
        rendimento: 0,
        message: "Nenhum rendimento gerado ainda",
      });
    }

    return NextResponse.json({
      userId,
      rendimento: Number(ultimo.amount),
      data: ultimo.dateKey,
      createdAt: ultimo.createdAt,
    });
  } catch (error) {
    console.error("Erro ao buscar rendimento:", error);
    return NextResponse.json({ error: "Erro ao buscar rendimento" }, { status: 500 });
  }
}
