import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

type Body = {
  metodo: string;
  valor: string;
};

function normalizeMetodo(metodo: string) {
  const norm = metodo.trim().toUpperCase();
  if (norm === "PIX") return "PIX";
  if (norm === "USDT") return "USDT";
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const { metodo, valor }: Body = await req.json();

    if (!metodo || !valor) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const metodoNorm = normalizeMetodo(metodo);
    if (!metodoNorm) {
      return NextResponse.json({ error: "Método inválido. Use PIX ou USDT." }, { status: 400 });
    }

    const userId = Number(session.user.id);

    if (metodoNorm === "PIX") {
      await prisma.user.update({
        where: { id: userId },
        data: { pixKey: valor },
      });
    } else if (metodoNorm === "USDT") {
      await prisma.user.update({
        where: { id: userId },
        data: { carteira: valor },
      });
    }

    return NextResponse.json({
      message: `${metodoNorm} cadastrado com sucesso!`,
    });
  } catch (error) {
    console.error("[CADASTRAR_METODO_ERROR]", error);
    return NextResponse.json({ error: "Erro ao cadastrar método" }, { status: 500 });
  }
}