// app/api/reinvestir/route.ts
import { prisma } from "../../../lib/prisma"; // caminho relativo correto
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions"; // caminho relativo ajustado

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const saldoAtual =
      typeof usuario.saldo === "object"
        ? (usuario.saldo as any).toNumber()
        : Number(usuario.saldo);

    if (saldoAtual <= 0) {
      return NextResponse.json({ error: "Saldo insuficiente para reinvestir" }, { status: 400 });
    }

    // ✅ Percentual diário ajustado para 1.5% (0.015)
    const percentualDiario = 0.015;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: usuario.id },
        data: { saldo: 0 },
      }),
      prisma.investimento.create({
        data: {
          userId: usuario.id,
          valor: saldoAtual,
          rendimentoAcumulado: 0,
          limite: saldoAtual * 3, // limite de lucro 3x o valor investido
          ativo: true,
          percentualDiario, // 1.5% diário
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Reinvestimento realizado!" });
  } catch (error) {
    console.error("Erro no reinvestir:", error);
    return NextResponse.json({ error: "Erro ao reinvestir" }, { status: 500 });
  }
}
