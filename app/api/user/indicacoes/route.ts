import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions' // ajuste aqui
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ erro: 'Usuário não autenticado' }, { status: 401 })
    }

    const userId = Number(session.user.id)

    const totalIndicados = await prisma.user.count({
      where: { indicadoPorId: userId },
    })

    return NextResponse.json({
      sucesso: true,
      totalIndicados,
    })
  } catch (erro) {
    console.error('[ERRO INDICAÇÕES]', erro)
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 })
  }
}
