// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server'
import prisma from '@lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório.' },
        { status: 400 }
      )
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      )
    }

    // Cria token de redefinição (64 caracteres)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hora

    // Salva o token no banco
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: expires, // ✅ corrigido
      },
    })

    // Link de redefinição
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    // Configuração do transporte de e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Corpo do e-mail
    const mailOptions = {
      from: `"Suporte BetZila" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de senha - BetZila',
      html: `
        <div style="font-family: Arial; text-align: center;">
          <h2>Redefinição de senha</h2>
          <p>Você solicitou redefinir sua senha. Clique no botão abaixo:</p>
          <a href="${resetUrl}" 
            style="background-color:#000; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none;">
            Redefinir Senha
          </a>
          <p>Se você não solicitou isso, ignore este e-mail.</p>
          <p style="font-size: 12px; color: gray;">Este link expira em 1 hora.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: 'E-mail enviado com sucesso!' })
  } catch (error) {
    console.error('Erro no forgot-password:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar e-mail.' },
      { status: 500 }
    )
  }
}
