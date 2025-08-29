import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
// caminho relativo até o authOptions
import { authOptions } from '../../auth/[...nextauth]/authOptions'
import { prisma } from '@lib/prisma' // ✅ corrigido

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const cpf = body.cpf

  if (!cpf || typeof cpf !== 'string' || cpf.replace(/\D/g, '').length !== 11) {
    return NextResponse.json({ message: 'CPF inválido' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { cpf },
    })
    return NextResponse.json({ message: 'CPF atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar CPF:', error)
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 })
  }
}
