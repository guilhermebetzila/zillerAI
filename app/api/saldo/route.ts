import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/saldo
 * Retorna saldo, valor investido, último rendimento, pontos e indicados
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const email = token.email;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        saldo: true,
        valorInvestido: true,
        pontos: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Último rendimento diário
    const ultimoRendimento = await prisma.rendimentoDiario.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { amount: true },
    });

    // Indicados diretos
    const indicadosDiretos = await prisma.user.count({
      where: { indicadoPorId: user.id },
    });

    // IDs dos diretos
    const idsDiretos = await prisma.user.findMany({
      where: { indicadoPorId: user.id },
      select: { id: true },
    });
    const idsDiretosArray = idsDiretos.map((u) => u.id);

    // Indicados indiretos
    let indicadosIndiretos = 0;
    if (idsDiretosArray.length > 0) {
      indicadosIndiretos = await prisma.user.count({
        where: { indicadoPorId: { in: idsDiretosArray } },
      });
    }

    const pontosDiretos = indicadosDiretos;
    const pontosIndiretos = indicadosIndiretos;
    const pontosTotais = user.pontos + pontosDiretos + pontosIndiretos;

    return NextResponse.json({
      saldo: user.saldo,
      valorInvestido: user.valorInvestido,
      rendimentoDiario: ultimoRendimento?.amount ?? 0,
      pontos: pontosTotais,
      pontosDiretos,
      pontosIndiretos,
      totalIndicados: indicadosDiretos + indicadosIndiretos,
    });
  } catch (error) {
    console.error("Erro ao buscar saldo:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}

/**
 * POST /api/saldo
 * Registra rendimento diário automático para o usuário (apenas 1 vez por dia)
 */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const email = token.email;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, valorInvestido: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const base = user.valorInvestido.toNumber();
    const rate = 0.01; // 1% ao dia
    const rendimento = base * rate;

    // Chave única por dia
    const dateKey = new Date().toISOString().split("T")[0];

    // Verifica se já existe rendimento registrado hoje
    const rendimentoExistente = await prisma.rendimentoDiario.findFirst({
      where: { userId: user.id, dateKey },
    });

    if (rendimentoExistente) {
      return NextResponse.json({
        message: "Rendimento de hoje já foi registrado",
        rendimento: rendimentoExistente.amount,
      });
    }

    // Salvar rendimento
    const novoRendimento = await prisma.rendimentoDiario.create({
      data: {
        userId: user.id,
        amount: new Prisma.Decimal(rendimento),
        base: new Prisma.Decimal(base),
        rate: new Prisma.Decimal(rate),
        dateKey,
      },
    });

    // Atualizar saldo do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        saldo: { increment: rendimento },
      },
    });

    return NextResponse.json({
      message: "Rendimento registrado com sucesso",
      rendimento: novoRendimento.amount,
    });
  } catch (error) {
    console.error("Erro ao registrar rendimento:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
