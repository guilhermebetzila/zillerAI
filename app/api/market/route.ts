import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// função auxiliar para buscar um ativo por vez
async function fetchBrapiQuote(symbol: string, brapiKey: string) {
  const res = await fetch(
    `https://brapi.dev/api/quote/${symbol}?token=${brapiKey}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Erro Brapi ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  return (
    json?.results?.map((a: any) => ({
      symbol: a.symbol,
      price: a.regularMarketPrice,
      source: "Brapi.dev",
    })) || []
  );
}

export async function GET() {
  try {
    // --- chave ExConvert
    const exKey =
      process.env.EXCONVERT_API_KEY || process.env.NEXT_PUBLIC_EXCONVERT_API_KEY;

    if (!exKey) {
      return NextResponse.json(
        { error: "Chave da ExConvert não encontrada nas envs" },
        { status: 500 }
      );
    }

    // --- chave Brapi
    const brapiKey =
      process.env.BRAPI_TOKEN ||
      process.env.BRAPI_API_KEY ||
      process.env.NEXT_PUBLIC_BRAPI_TOKEN;

    if (!brapiKey) {
      return NextResponse.json(
        { error: "Chave da Brapi.dev não encontrada nas envs" },
        { status: 500 }
      );
    }

    // --- ExConvert (USD/BRL) ---
    const urlUsd = `https://api.exconvert.com/convert?access_key=${exKey}&from=USD&to=BRL&amount=1`;
    const usdRes = await fetch(urlUsd, { cache: "no-store" });

    if (!usdRes.ok) {
      throw new Error(`Erro ExConvert ${usdRes.status}: ${await usdRes.text()}`);
    }

    const usdJson = await usdRes.json();
    const rawUsd =
      usdJson?.result?.BRL ??
      usdJson?.result ??
      usdJson?.rate ??
      usdJson?.info?.rate ??
      null;

    const usdPrice =
      typeof rawUsd === "string"
        ? parseFloat(rawUsd.replace(",", "."))
        : Number(rawUsd);

    if (!usdPrice || Number.isNaN(usdPrice)) {
      throw new Error("Preço inválido recebido da ExConvert");
    }

    // --- Brapi (busca 1 por vez) ---
    const win = await fetchBrapiQuote("WINFUT", brapiKey);
    const wdo = await fetchBrapiQuote("WDOFUT", brapiKey);

    const brapiAssets = [...win, ...wdo];

    // --- Resultado final ---
    const assets = [
      {
        symbol: "USD/BRL",
        price: usdPrice,
        source: "ExConvert",
      },
      ...brapiAssets,
    ];

    return NextResponse.json({
      updated: new Date().toISOString(),
      assets,
    });
  } catch (error: any) {
    console.error("Erro /api/market:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao buscar cotações" },
      { status: 500 }
    );
  }
}
