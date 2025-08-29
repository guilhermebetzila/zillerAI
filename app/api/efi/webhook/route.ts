import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; // caminho relativo corrigido

// 🔹 POST: recebe notificações de PIX da Efí
export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    console.log("📩 Webhook recebido da Efí:", body);

    const { txid, status } = body;

    if (!txid) {
      console.warn("⚠️ txid não informado no webhook");
      return NextResponse.json({ ok: false, error: "txid ausente" }, { status: 400 });
    }

    // 🔹 Atualiza saque baseado no status
    let saque;
    if (status === "CONCLUIDO") {
      saque = await prisma.saque.updateMany({
        where: { txHash: txid, status: "processando" },
        data: { status: "concluido", processadoEm: new Date() },
      });
      console.log(`✅ Saque(s) concluído(s):`, saque.count);
    } else if (status === "REJEITADO" || status === "CANCELADO") {
      saque = await prisma.saque.updateMany({
        where: { txHash: txid, status: "processando" },
        data: { status: "rejeitado", processadoEm: new Date() },
      });
      console.log(`⚠️ Saque(s) rejeitado(s):`, saque.count);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Erro ao processar webhook:", err.message || err);
    return NextResponse.json({ ok: false, error: err.message || "Erro interno" }, { status: 500 });
  }
}

// 🔹 GET opcional para teste do endpoint
export async function GET() {
  return NextResponse.json({ status: "Webhook ativo 🚀" }, { status: 200 });
}
