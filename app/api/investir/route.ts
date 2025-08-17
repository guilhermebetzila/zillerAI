import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// Endpoint para investir
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const body = await req.json();
    const valor = parseFloat(body.valor);

    if (isNaN(valor) || valor < 1) {
      return NextResponse.json(
        { error: "Valor inválido para investir (mínimo R$1)" },
        { status: 400 }
      );
    }

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        saldo: true,
        valorInvestido: true,
        pontos: true,
        graduacaoId: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const saldoAtual = Number(usuario.saldo);
    const investidoAtual = Number(usuario.valorInvestido);

    if (saldoAtual < valor) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Atualiza saldo e valor investido
    await prisma.user.update({
      where: { id: userId },
      data: {
        saldo: saldoAtual - valor,
        valorInvestido: investidoAtual + valor,
      },
    });

    // Cria o investimento
    await prisma.investimento.create({
      data: {
        userId,
        valor,
        percentualDiario:
          valor <= 5000
            ? 1.5
            : valor <= 10000
            ? parseFloat((Math.random() * (1.8 - 1.6) + 1.6).toFixed(2))
            : parseFloat((Math.random() * (2.5 - 2.0) + 2.0).toFixed(2)),
        rendimentoAcumulado: 0,
        limite: valor * 2,
        ativo: true,
      },
    });

    // Atualiza pontos incluindo rede direta e indireta
    const pontosTotais = await calcularPontos(userId);

    // Atualiza graduação
    const graduacao = await atualizarGraduacao(userId, pontosTotais);

    return NextResponse.json({
      message: "Investimento registrado com sucesso!",
      pontos: pontosTotais,
      graduacao: graduacao?.nome || null,
    });
  } catch (error) {
    console.error("Erro ao investir:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// Função para calcular pontos incluindo todos os indicados (diretos e indiretos)
async function calcularPontos(userId: number): Promise<number> {
  const usuario = await prisma.user.findUnique({ where: { id: userId } });
  if (!usuario) return 0;

  const investimentosProprios = await prisma.investimento.findMany({ where: { userId } });
  let totalInvestido = investimentosProprios.reduce((acc, i) => acc + Number(i.valor), 0);

  async function somarRede(id: number): Promise<number> {
    const indicados = await prisma.user.findMany({ where: { indicadoPorId: id } });
    let total = 0;
    for (const ind of indicados) {
      const inv = await prisma.investimento.findMany({ where: { userId: ind.id } });
      total += inv.reduce((acc, i) => acc + Number(i.valor), 0);
      total += await somarRede(ind.id);
    }
    return total;
  }

  totalInvestido += await somarRede(userId);

  const pontos = Math.floor(totalInvestido / 2);

  await prisma.user.update({
    where: { id: userId },
    data: { pontos },
  });

  return pontos;
}

// Função para atualizar graduação com base nos pontos
async function atualizarGraduacao(userId: number, pontos: number) {
  const graduacoes = await prisma.graduacao.findMany({
    orderBy: { pontos: "asc" },
  });

  const novaGraduacao = graduacoes.filter((g) => pontos >= g.pontos).pop();

  if (novaGraduacao) {
    await prisma.user.update({
      where: { id: userId },
      data: { graduacaoId: novaGraduacao.id },
    });
  }

  return novaGraduacao;
}
