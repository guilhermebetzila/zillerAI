// app/api/saque/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusSaque } from "@prisma/client";
import { efiSendPix } from "@/lib/efi";

export async function POST(req: Request) {
  try {
    const { userId, valor, metodo, chavePix, carteiraUsdt } = await req.json();

    if (!userId || !valor || !metodo) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { saldo: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    if (Number(usuario.saldo) < valorNum) {
      return NextResponse.json({ error: "Saldo insuficiente." }, { status: 400 });
    }

    // 1️⃣ Cria o registro de saque no banco com status pendente
    const saque = await prisma.saque.create({
      data: {
        userId: Number(userId),
        valor: valorNum,
        tipo: metodo,
        chavePix: metodo === "PIX" ? chavePix : null,
        txHash: metodo === "USDT" ? carteiraUsdt : null,
        status: StatusSaque.pendente,
      },
    });

    // 2️⃣ Debita o saldo do usuário
    await prisma.user.update({
      where: { id: Number(userId) },
      data: { saldo: Number(usuario.saldo) - valorNum },
    });

    // 3️⃣ Se for PIX, enviar via EFI
    if (metodo === "PIX") {
      try {
        const respPix = await efiSendPix({
          idEnvio: `saque-${saque.id}`,           // idempotência
          amount: valorNum,
          payerKey: process.env.EFI_PAYER_KEY!,   // sua chave PIX da EFI
          recipientKey: chavePix,
          description: `Saque de R$ ${valorNum} para usuário ${userId}`,
        });

        // 4️⃣ Atualiza o saque como concluído
        await prisma.saque.update({
          where: { id: saque.id },
          data: {
            status: StatusSaque.concluido,
            txHash: respPix.e2eId,
            processadoEm: new Date(),
          },
        });
      } catch (err) {
        console.error("Erro ao enviar PIX EFI:", err);

        // 5️⃣ Se falhar, devolve o saldo e marca saque como rejeitado
        await prisma.user.update({
          where: { id: Number(userId) },
          data: { saldo: { increment: valorNum } },
        });

        await prisma.saque.update({
          where: { id: saque.id },
          data: { status: StatusSaque.rejeitado, processadoEm: new Date() },
        });

        return NextResponse.json({ error: "Falha ao enviar PIX, saldo devolvido." }, { status: 500 });
      }
    }

    // 6️⃣ Se USDT ou PIX concluído, retorna o saque
    return NextResponse.json(saque, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar pedido de saque:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
