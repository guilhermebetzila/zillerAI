// app/api/investir/historico/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 🔎 Busca investimentos já ordenados
    const historico = await prisma.investimento.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { criadoEm: 'desc' },
    })

    // 🔄 Converte Decimals para string
    const historicoFormatado = historico.map((i) => ({
      id: i.id,
      valor: i.valor?.toString() ?? "0",
      percentualDiario: i.percentualDiario?.toString() ?? "0",
      rendimentoAcumulado: i.rendimentoAcumulado?.toString() ?? "0",
      criadoEm: i.criadoEm,
      ativo: i.ativo,
      userId: i.userId,
    }))

    return NextResponse.json({
      total: historicoFormatado.length,
      historico: historicoFormatado,
    })
  } catch (error) {
    console.error("❌ Erro em /api/investir/historico:", error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
