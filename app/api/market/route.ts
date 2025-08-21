import { NextResponse } from "next/server";

export async function GET() {
  try {
    const brapiToken = process.env.BRAPI_TOKEN;
    const exconvertKey = process.env.EXCONVERT_API_KEY;

    if (!brapiToken || !exconvertKey) {
      throw new Error("Tokens de API não configurados no .env");
    }

    // 1️⃣ Buscar Ibovespa (BRAPI) – apenas 1 ativo por vez no plano free
    const ibovRes = await fetch(
      `https://brapi.dev/api/quote/^BVSP?token=${brapiToken}`,
      { cache: "no-store" }
    );
    const ibovData = await ibovRes.json();

    if (ibovData.error) {
      throw new Error(`Erro Brapi (IBOV): ${ibovData.message}`);
    }

    // 2️⃣ Buscar USD/BRL (ExConvert)
    const dolarRes = await fetch(
      `https://api.exconvert.com/convert?from=USD&to=BRL&amount=1&apiKey=${exconvertKey}`,
      { cache: "no-store" }
    );
    const dolarData = await dolarRes.json();

    if (dolarData.error) {
      throw new Error(`Erro ExConvert: ${dolarData.message}`);
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
          price: dolarData.result ?? null,
          source: "exconvert",
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
