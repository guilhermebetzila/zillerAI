import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { investimentos: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    let totalRendimentoGerado = 0;
    const dataHoje = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    for (const investimento of usuario.investimentos) {
      if (!investimento.ativo) continue;

      // Conversões seguras de tipos Decimal → number
      const valor = Number(investimento.valor) || 0;
      const percentual = Number(investimento.percentualDiario) || 0.025; // 2,5% ao dia
      const rendimento = valor * percentual;

      if (rendimento <= 0) continue;

      // 1️⃣ Registra o rendimento diário
      await prisma.rendimentoDiario.create({
        data: {
          userId: usuario.id,
          investimentoId: investimento.id,
          dateKey: dataHoje,
          base: valor.toFixed(2),
          rate: percentual.toString(),
          amount: rendimento.toFixed(2),
        },
      });

      // 2️⃣ Atualiza o rendimento acumulado do investimento
      const rendimentoAcumuladoAtual = Number(investimento.rendimentoAcumulado) || 0;
      await prisma.investimento.update({
        where: { id: investimento.id },
        data: {
          rendimentoAcumulado: (rendimentoAcumuladoAtual + rendimento).toFixed(2),
        },
      });

      totalRendimentoGerado += rendimento;
    }

    // 3️⃣ Atualiza o saldo total do usuário com os rendimentos
    if (totalRendimentoGerado > 0) {
      const saldoAtual = Number(usuario.saldo) || 0;
      await prisma.user.update({
        where: { id: usuario.id },
        data: {
          saldo: (saldoAtual + totalRendimentoGerado).toFixed(2),
        },
      });
    }

    // 4️⃣ Calcula bônus de indicação em 3 níveis
    const valorInvestidoTotal = usuario.investimentos.reduce(
      (acc, inv) => acc + Number(inv.valor || 0),
      0
    );

    // Nível 1
    const nivel1 = usuario.indicadoPorId
      ? await prisma.user.findUnique({ where: { id: usuario.indicadoPorId } })
      : null;

    // Nível 2
    const nivel2 = nivel1?.indicadoPorId
      ? await prisma.user.findUnique({ where: { id: nivel1.indicadoPorId } })
      : null;

    // Nível 3
    const nivel3 = nivel2?.indicadoPorId
      ? await prisma.user.findUnique({ where: { id: nivel2.indicadoPorId } })
      : null;

    if (nivel1) {
      await prisma.user.update({
        where: { id: nivel1.id },
        data: { bonusResidual: { increment: valorInvestidoTotal * 0.10 } },
      });
    }
    if (nivel2) {
      await prisma.user.update({
        where: { id: nivel2.id },
        data: { bonusResidual: { increment: valorInvestidoTotal * 0.05 } },
      });
    }
    if (nivel3) {
      await prisma.user.update({
        where: { id: nivel3.id },
        data: { bonusResidual: { increment: valorInvestidoTotal * 0.02 } },
      });
    }

    return NextResponse.json({
      sucesso: true,
      totalRendimentoGerado: totalRendimentoGerado.toFixed(2),
      mensagem: `💰 Rendimentos diários de ${totalRendimentoGerado.toFixed(2)} creditados com sucesso!`,
    });
  } catch (error) {
    console.error("❌ Erro em /api/investir/gerarRendimentos:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
