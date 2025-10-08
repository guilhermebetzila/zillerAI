import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    // 🔹 Gerar token único e expiração
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 minutos

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // 🔹 Cria o link de redefinição
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

    // 🔹 Configura o transporte de e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"BetZila Suporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de senha - BetZila',
      html: `
        <h2>Redefinição de Senha</h2>
        <p>Olá! Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>⚠️ Este link expira em 30 minutos.</p>
      `,
    })

    return NextResponse.json({ message: 'E-mail de redefinição enviado com sucesso.' })
  } catch (error: any) {
    console.error('Erro ao enviar e-mail:', error)
    return NextResponse.json({ error: 'Erro interno ao enviar e-mail.' }, { status: 500 })
  }
}
