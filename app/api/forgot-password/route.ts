import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    }

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // Gera token e define expiração (1 hora)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Remove tokens antigos e cria um novo
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    // Link de redefinição (ajuste o domínio se necessário)
    const resetLink = `https://betzila.com.br/reset-password/${token}`;

    // Configura transporte SMTP (Gmail ou outro provedor)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Envia o e-mail
    await transporter.sendMail({
      from: `"BetZila Suporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Redefinição de senha - BetZila",
      html: `
        <div style="font-family: Arial; line-height:1.5; color:#333;">
          <h2>Redefinição de Senha</h2>
          <p>Você solicitou redefinir sua senha. Clique no botão abaixo:</p>
          <p>
            <a href="${resetLink}" style="background:#0d6efd; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none;">Redefinir senha</a>
          </p>
          <p>Ou copie e cole este link no navegador:</p>
          <p>${resetLink}</p>
          <br/>
          <small>Este link expira em 1 hora.</small>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "E-mail de recuperação enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    return NextResponse.json({ error: "Erro interno ao enviar e-mail." }, { status: 500 });
  }
}
