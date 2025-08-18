'use server'

import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, cpf, password, indicador } = await req.json()

    if (!name || !email || !cpf || !password) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      )
    }

    const senhaRegex =
      /^(?=.*[A-Z])(?=(?:.*[a-z]){2,})(?=.*\d)(?=.*[!@#$%^&*()_+\-[\]{};:'",.<>\/?\\|]).{6,}$/
    if (!senhaRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            'A senha deve ter pelo menos 1 letra maiúscula, 2 letras minúsculas, 1 número e 1 caractere especial.',
        },
        { status: 400 }
      )
    }

    // Evitar duplicados
    if (await prisma.user.findUnique({ where: { email } }))
      return NextResponse.json(
        { message: 'E-mail já cadastrado.' },
        { status: 400 }
      )

    if (await prisma.user.findUnique({ where: { cpf } }))
      return NextResponse.json(
        { message: 'CPF já cadastrado.' },
        { status: 400 }
      )

    let indicadoPorId: number | null = null
    if (indicador) {
      const userIndicador = await prisma.user.findFirst({
        where: {
          OR: [
            { email: indicador },
            { nome: indicador },
            { id: isNaN(Number(indicador)) ? -1 : Number(indicador) },
          ],
        },
      })
      if (userIndicador) indicadoPorId = userIndicador.id
    }

    const hashedPassword = await hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        nome: name,
        email,
        cpf,
        senha: hashedPassword,
        indicadoPorId,
        indicador: indicador || null,
      },
    })

    try {
      await sendWelcomeEmail(email, name)
    } catch (err) {
      console.error('Erro ao enviar email:', err)
    }

    // Cria JWT + cookie
    const token = sign(
      { id: newUser.id, nome: newUser.nome, email: newUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      success: true,
      userId: newUser.id,
      message: 'Cadastro realizado com sucesso',
    })

    response.headers.set(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    )

    return response
  } catch (error: any) {
    console.error('[REGISTER] Erro inesperado:', error)
    return NextResponse.json(
      { message: `Erro interno: ${error.message || 'Erro desconhecido'}` },
      { status: 500 }
    )
  }
}
