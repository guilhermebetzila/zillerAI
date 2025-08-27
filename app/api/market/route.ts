import { NextResponse } from "next/server";

export async function GET() {
  try {
    const brapiToken = process.env.BRAPI_TOKEN;

    if (!brapiToken) {
      throw new Error("Token BRAPI não configurado no .env");
    }

    // 1️⃣ Buscar Ibovespa (BRAPI)
    const ibovRes = await fetch(
      `https://brapi.dev/api/quote/^BVSP?token=${brapiToken}`,
      { cache: "no-store" }
    );
    const ibovData = await ibovRes.json();

    if (ibovData.error) {
      throw new Error(`Erro Brapi (IBOV): ${ibovData.message}`);
    }

    // 2️⃣ Buscar USD/BRL (AwesomeAPI – sem token)
    const dolarRes = await fetch(
      "https://economia.awesomeapi.com.br/json/last/USD-BRL",
      { cache: "no-store" }
    );
    const dolarData = await dolarRes.json();

    const dolarPrice = parseFloat(dolarData?.USDBRL?.bid ?? "0");

    if (!dolarPrice) {
      console.error("Resposta da AwesomeAPI:", dolarData);
      throw new Error("Erro ao buscar USD/BRL na AwesomeAPI");
    }

    // 3️⃣ Montar resposta unificada
    return NextResponse.json({
      updated: new Date().toISOString(),
      assets: [
        {
          symbol: "IBOV",
          price: ibovData.results?.[0]?.regularMarketPrice ?? null,
          source: "brapi.dev",
        },
        {
          symbol: "USD/BRL",
          price: dolarPrice,
          source: "awesomeapi.com.br",
        },
      ],
    });
  } catch (error: any) {
    console.error("Erro /api/market:", error);
    return NextResponse.json(
      { error: true, message: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}
