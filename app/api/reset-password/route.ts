import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma"; // ⬅️ use exatamente esse caminho
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, novaSenha } = await req.json();

    if (!token || !novaSenha) {
      return NextResponse.json({ error: "Token e nova senha são obrigatórios." }, { status: 400 });
    }

    // Busca o token e verifica validade
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
    }

    // Atualiza senha do usuário
    const hash = await bcrypt.hash(novaSenha, 10);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { senha: hash },
    });

    // Deleta token após uso
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    return NextResponse.json({ success: true, message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json({ error: "Erro interno ao redefinir senha." }, { status: 500 });
  }
}
