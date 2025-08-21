import { NextResponse } from "next/server";

export async function GET() {
  const urls = {
    nasdaq: "https://query1.finance.yahoo.com/v7/finance/quote?symbols=^IXIC",
    dolar: "https://query1.finance.yahoo.com/v7/finance/quote?symbols=USDBRL=X",
    miniIndice: "https://query1.finance.yahoo.com/v7/finance/quote?symbols=^BVSP",
  };

  const [nasdaqRes, dolarRes, miniRes] = await Promise.all(
    Object.values(urls).map((url) => fetch(url).then((r) => r.json()))
  );

  return NextResponse.json({
    nasdaq: nasdaqRes.quoteResponse.result[0].regularMarketPrice,
    dolar: dolarRes.quoteResponse.result[0].regularMarketPrice,
    miniIndice: miniRes.quoteResponse.result[0].regularMarketPrice,
  });
}
