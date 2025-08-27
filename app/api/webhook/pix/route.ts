import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusSaque } from "@prisma/client";

// Essa rota será chamada pela EFI
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.pix || !Array.isArray(body.pix)) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    for (const pix of body.pix) {
      const { txid, status } = pix;

      if (!txid) continue;

      // 🔍 Procurar o saque relacionado
      const saque = await prisma.saque.findFirst({
        where: { txHash: txid }, // Se você armazenar endToEndId, troque aqui
      });

      if (saque) {
        let novoStatus: StatusSaque = StatusSaque.pendente;

        if (status === "CONCLUIDA") {
          novoStatus = StatusSaque.concluido; // ✅ corrigido
        } else if (status === "CANCELADA" || status === "DEVOLVIDA") {
          novoStatus = StatusSaque.rejeitado;

          // ✅ opcional: devolver saldo ao usuário se falhar
          await prisma.user.update({
            where: { id: saque.userId },
            data: { saldo: { increment: saque.valor } },
          });
        }

        await prisma.saque.update({
          where: { id: saque.id },
          data: { status: novoStatus, processadoEm: new Date() },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook Pix:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
