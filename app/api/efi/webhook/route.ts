import { NextResponse } from "next/server";

// 🔹 Recebe notificações de PIX da Efí
export async function POST(req: Request) {
  try {
    // Parse do corpo da requisição
    const body: any = await req.json();
    console.log("📩 Webhook recebido da Efí:", body);

    // TODO: Aqui você pode:
    // - Salvar no banco de dados
    // - Enviar para uma fila de processamento
    // - Atualizar saldo do usuário
    // Exemplo:
    // await prisma.saque.create({ data: { ... } });

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
