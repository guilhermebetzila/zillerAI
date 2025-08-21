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

    // 2️⃣ Buscar USD/BRL (Exchangerate.host)
    const dolarRes = await fetch(
      `https://api.exchangerate.host/convert?from=USD&to=BRL&amount=1`,
      { cache: "no-store" }
    );
    const dolarData = await dolarRes.json();

    // garante que pega tanto result quanto info.rate
    const dolarPrice =
      typeof dolarData?.result === "number"
        ? dolarData.result
        : typeof dolarData?.info?.rate === "number"
        ? dolarData.info.rate
        : null;

    if (!dolarPrice) {
      console.error("Resposta da exchangerate.host:", dolarData);
      throw new Error("Erro ao buscar USD/BRL na exchangerate.host");
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
          source: "exchangerate.host",
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
