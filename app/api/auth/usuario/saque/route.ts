import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { Prisma } from "@prisma/client";

type Body = {
  valor: number | string;
  metodo?: string;      // "PIX" | "USDT" (aceita minúsculas também)
  descricao?: string;   // opcional
};

function normalizeMetodo(m?: string) {
  const norm = (m || "PIX").trim().toUpperCase();
  if (norm !== "PIX" && norm !== "USDT") return null;
  return norm as "PIX" | "USDT";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const { valor, metodo, descricao }: Body = await req.json();

    const valorNumber = Number(valor);
    if (!valor || isNaN(valorNumber) || valorNumber <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    const metodoNorm = normalizeMetodo(metodo);
    if (!metodoNorm) {
      return NextResponse.json({ error: "Método inválido. Use PIX ou USDT." }, { status: 400 });
    }

    const userId = Number(session.user.id);

    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true, pixKey: true, carteira: true, id: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const saldoAtual = usuario.saldo instanceof Prisma.Decimal
      ? usuario.saldo.toNumber()
      : Number(usuario.saldo);

    if (valorNumber > saldoAtual) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Validar chaves por método
    if (metodoNorm === "PIX" && !usuario.pixKey) {
      return NextResponse.json({ error: "Chave Pix (pixKey) não cadastrada" }, { status: 400 });
    }
    if (metodoNorm === "USDT" && !usuario.carteira) {
      return NextResponse.json({ error: "Carteira USDT (carteira) não cadastrada" }, { status: 400 });
    }

    // Transação: cria o saque + decrementa saldo
    const [saque, usuarioAtualizado] = await prisma.$transaction([
      prisma.saque.create({
        data: {
          userId: userId,
          valor: new Prisma.Decimal(valorNumber),
          status: "pendente",
          metodo: metodoNorm,
          descricao: descricao || null,
          chave: metodoNorm === "PIX" ? usuario.pixKey! : usuario.carteira || null,
        },
        select: { id: true, status: true, metodo: true, criadoEm: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { saldo: { decrement: new Prisma.Decimal(valorNumber) } },
        select: { saldo: true },
      }),
    ]);

    const novoSaldo = usuarioAtualizado.saldo instanceof Prisma.Decimal
      ? usuarioAtualizado.saldo.toNumber()
      : Number(usuarioAtualizado.saldo);

    return NextResponse.json({
      message: "Saque solicitado com sucesso!",
      saqueId: saque.id,
      status: saque.status,
      metodo: saque.metodo,
      criadoEm: saque.criadoEm,
      saldo: novoSaldo,
    });
  } catch (error) {
    console.error("[SAQUE_POST_ERROR]", error);
    return NextResponse.json({ error: "Erro ao processar saque" }, { status: 500 });
  }
}
