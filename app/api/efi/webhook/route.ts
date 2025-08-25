import { NextResponse } from "next/server";

// POST: Efí vai chamar quando cair um PIX
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Webhook recebido da Efí:", body);

    // ⚡ Aqui você pode salvar no banco ou enviar para fila
    // Por enquanto só retorna sucesso
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Erro ao processar webhook:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET opcional: só para teste rápido no navegador
export async function GET() {
  return NextResponse.json({ status: "Webhook ativo 🚀" }, { status: 200 });
}
