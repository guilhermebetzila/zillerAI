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

    // ---- 1) Cotação do dólar (USD/BRL) ----
    const fxUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=BRL&apikey=${apiKey}`;
    const fxRes = await fetch(fxUrl);
    const fxData = await fxRes.json();

    const usdBrl =
      fxData["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"];

    // ---- 2) Cotação da Apple (AAPL - Nasdaq) ----
    const stockUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AAPL&interval=5min&apikey=${apiKey}`;
    const stockRes = await fetch(stockUrl);
    const stockData = await stockRes.json();

    const latestKey =
      stockData["Meta Data"]?.["3. Last Refreshed"] ||
      Object.keys(stockData["Time Series (5min)"] || {})[0];

    const stockPrice =
      stockData["Time Series (5min)"]?.[latestKey]?.["4. close"];

    return NextResponse.json({
      forex: {
        symbol: "USD/BRL",
        price: usdBrl ? parseFloat(usdBrl) : null,
      },
      stock: {
        symbol: "AAPL",
        price: stockPrice ? parseFloat(stockPrice) : null,
      },
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
