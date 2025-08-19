import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { emailOrCpf, password } = await req.json()

    if (!emailOrCpf || !password) {
      return NextResponse.json({ message: 'Preencha todos os campos' }, { status: 400 })
    }

    // Permite login tanto por email quanto por CPF
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrCpf },
          { cpf: emailOrCpf }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    }

    // Confere senha
    const senhaCorreta = await compare(password, user.senha)
    if (!senhaCorreta) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
    }

    // Atualiza último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        saldo: user.saldo
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 })
  }
}
