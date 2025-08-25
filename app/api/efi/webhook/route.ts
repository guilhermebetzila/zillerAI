import { NextResponse } from "next/server";

// 🚨 POST: Aqui a Efí vai bater quando cair um PIX
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📩 Webhook recebido da Efí:", body);

    // 🔹 TODO: salvar no banco, enviar fila, etc.
    // por enquanto só retorna sucesso
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Erro ao processar webhook:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// 👀 GET opcional: debug do webhook
export async function GET() {
  // Retorna 200 direto, mesmo se houver trailing slash
  return NextResponse.json({ status: "Webhook ativo 🚀" });
}
