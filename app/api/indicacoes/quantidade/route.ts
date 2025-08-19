import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Token ausente' }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!)
    const userId = decoded?.id // 👈 pegar o ID do usuário, não o nome

    if (!userId) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Conta quantos usuários foram indicados por este usuário
    const quantidadeIndicados = await prisma.user.count({
      where: {
        indicadoPorId: userId, // 👈 agora usa o campo correto
      },
    })

    return NextResponse.json({ quantidade: quantidadeIndicados })
  } catch (error) {
    console.error('Erro ao buscar quantidade de indicados:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
