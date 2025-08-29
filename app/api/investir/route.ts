// app/api/investir/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma"; // caminho relativo
import { authOptions } from "../auth/[...nextauth]/authOptions";

// Tipos auxiliares ajustados
type InvestimentoType = {
  id: number; // ⚠️ mudou para number
  valor: string;
  percentualDiario: string;
  rendimentoAcumulado: string;
  criadoEm: Date;
  ativo: boolean;
};

type RendimentoType = {
  id: number; // ⚠️ mudou para number
  dateKey: string;
  base: string;
  rate: string;
  amount: string;
  createdAt: Date;
};

// GET: retorna saldo, investimentos e rendimentos do usuário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        investimentos: { orderBy: { criadoEm: "desc" } },
        rendimentos: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 💰 Total investido (somente ativos)
    const valorInvestido = usuario.investimentos
      .filter((i) => i.ativo)
      .reduce((acc, i) => acc + Number(i.valor ?? 0), 0);

    // 📦 Formatar investimentos
    const investimentos: InvestimentoType[] = usuario.investimentos.map((i) => ({
      id: i.id,
      valor: (i.valor ?? 0).toString(),
      percentualDiario: (i.percentualDiario ?? 0).toString(),
      rendimentoAcumulado: (i.rendimentoAcumulado ?? 0).toString(),
      criadoEm: i.criadoEm,
      ativo: i.ativo,
    }));

    // 📦 Formatar rendimentos
    const rendimentos: RendimentoType[] = usuario.rendimentos.map((r) => ({
      id: r.id,
      dateKey: r.dateKey,
      base: (r.base ?? 0).toString(),
      rate: (r.rate ?? 0).toString(),
      amount: (r.amount ?? 0).toString(),
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      saldo: (usuario.saldo ?? 0).toString(),
      valorInvestido: valorInvestido.toString(),
      investimentos,
      rendimentos,
    });
  } catch (error) {
    console.error("❌ Erro em /api/investir:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
