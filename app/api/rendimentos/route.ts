import { NextResponse } from "next/server";
import { gerarRendimentoDiario } from "@/lib/rendimento";

export async function POST() {
  try {
    const resultado = await gerarRendimentoDiario();
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar rendimentos:", error);
    return NextResponse.json({ error: "Erro ao gerar rendimentos" }, { status: 500 });
  }
}
