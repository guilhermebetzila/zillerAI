import { NextResponse } from "next/server";

export async function GET() {
  try {
    const brapiToken = process.env.BRAPI_TOKEN;
    const exconvertKey = process.env.EXCONVERT_API_KEY;

    // 1️⃣ Buscar Ibovespa na Brapi
    const ibovRes = await fetch(`https://brapi.dev/api/quote/^BVSP?token=${brapiToken}`);
    const ibovData = await ibovRes.json();

    if (ibovData.error) {
      throw new Error(`Erro Brapi (IBOV): ${ibovData.message}`);
    }

    // 2️⃣ Buscar USD/BRL na ExConvert
    const dolarRes = await fetch(`https://api.exconvert.com/convert?from=USD&to=BRL&amount=1&apiKey=${exconvertKey}`);
    const dolarData = await dolarRes.json();

    if (dolarData.error) {
      throw new Error(`Erro ExConvert: ${dolarData.message}`);
    }

    // 3️⃣ Montar resposta unificada
    return NextResponse.json({
      ibovespa: ibovData.results?.[0] || ibovData,
      dolar: dolarData
    });

  } catch (error: any) {
    console.error("Erro /api/market:", error);
    return NextResponse.json(
      { error: true, message: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}
