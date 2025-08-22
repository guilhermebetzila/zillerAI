import { NextResponse } from "next/server";
import { gerarRendimentoDiario, calcularRendimentoUsuario } from "@/lib/rendimento";

// 🔹 POST /api/rendimento
// Aplica rendimentos a todos os usuários
export async function POST() {
  try {
    const resultado = await gerarRendimentoDiario();
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar rendimentos:", error);
    return NextResponse.json(
      { error: "Erro ao gerar rendimentos" },
      { status: 500 }
    );
  }
}

// 🔹 GET /api/rendimento?userId=123
// Calcula rendimento de um único usuário (simulação, sem salvar)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Informe o userId na query" },
        { status: 400 }
      );
    }

    const rendimento = await calcularRendimentoUsuario(Number(userId));
    return NextResponse.json({ userId: Number(userId), rendimento });
  } catch (error) {
    console.error("Erro ao calcular rendimento:", error);
    return NextResponse.json(
      { error: "Erro ao calcular rendimento" },
      { status: 500 }
    );
  }
}
