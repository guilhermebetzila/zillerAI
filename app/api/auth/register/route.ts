'use server'

import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, cpf, password, indicador } = await req.json()

    // Campos obrigatórios
    if (!name || !email || !cpf || !password) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      )
    }

    // Validação da senha
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
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json(
        { message: 'E-mail já cadastrado.' },
        { status: 400 }
      )
    }

    if (await prisma.user.findUnique({ where: { cpf } })) {
      return NextResponse.json(
        { message: 'CPF já cadastrado.' },
        { status: 400 }
      )
    }

    // Verifica se existe indicador válido
    let indicadoPorId: number | null = null
    if (indicador) {
      const userIndicador = await prisma.user.findFirst({
        where: {
          OR: [
            { email: indicador },
            { nome: indicador },
            { id: Number.isInteger(Number(indicador)) ? Number(indicador) : -1 },
          ],
        },
      })
      if (!userIndicador) {
        return NextResponse.json(
          { message: 'Indicador não encontrado.' },
          { status: 400 }
        )
      }
      indicadoPorId = userIndicador.id
    }

    const hashedPassword = await hash(password, 10)

    // Cria usuário já com lastLogin = agora
    const newUser = await prisma.user.create({
      data: {
        nome: name,
        email,
        cpf,
        senha: hashedPassword,
        indicadoPorId,
        lastLogin: new Date(), // ✅ salva último login como data de cadastro
      },
    })

    try {
      await sendWelcomeEmail(email, name)
    } catch (err) {
      console.error('Erro ao enviar email:', err)
    }

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      message: 'Cadastro realizado com sucesso',
    })
  } catch (error: any) {
    console.error('[REGISTER] Erro inesperado:', error)
    return NextResponse.json(
      { message: `Erro interno: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}` },
      { status: 500 }
    )
  }
}
