import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Retorna dado fixo simulado
    return NextResponse.json({
      symbol: "USD/BRL",
      price: 5.25,
      source: "Mock API",
      updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro mock:", error);
    return NextResponse.json(
      { error: "Erro interno mock" },
      { status: 500 }
    );
  }
}
