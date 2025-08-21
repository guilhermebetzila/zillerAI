// app/api/market/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 🔹 Simula valores de mercado em tempo real
    const data = {
      nasdaq: 12000 + Math.random() * 200,   // varia entre 12000 e 12200
      miniIndice: 115000 + Math.random() * 500, // varia entre 115000 e 115500
      dolar: 4.5 + Math.random() * 0.1,      // varia entre 4.5 e 4.6
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no /api/market:", error);
    return NextResponse.json({ error: "Erro ao obter dados de mercado" }, { status: 500 });
  }
}
