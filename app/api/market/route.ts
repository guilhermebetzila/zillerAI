import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Alpha Vantage API key não configurada" },
        { status: 500 }
      );
    }

    // Cotação do dólar (USD/BRL)
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=BRL&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const usdBrl = data["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];

    return NextResponse.json({
      symbol: "USD/BRL",
      price: usdBrl ? parseFloat(usdBrl) : null,
      source: "Alpha Vantage",
      updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro Alpha Vantage:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar dados" },
      { status: 500 }
    );
  }
}
