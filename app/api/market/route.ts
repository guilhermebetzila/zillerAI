import { NextResponse } from "next/server";

// evita cache em Edge/Node
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 🔑 chave da ExConvert
    const exKey =
      process.env.EXCONVERT_API_KEY || process.env.NEXT_PUBLIC_EXCONVERT_API_KEY;

    if (!exKey) {
      return NextResponse.json(
        { error: "Chave da ExConvert não encontrada nas envs" },
        { status: 500 }
      );
    }

    // 🔑 chave da brapi.dev
    const brapiKey =
      process.env.BRAPI_TOKEN || process.env.NEXT_PUBLIC_BRAPI_TOKEN;

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

    // --- Brapi (WINFUT e WDOFUT) ---
    const urlBrapi = `https://brapi.dev/api/quote/WINFUT,WDOFUT?token=${brapiKey}`;
    const brapiRes = await fetch(urlBrapi, { cache: "no-store" });

    if (!brapiRes.ok) {
      throw new Error(`Erro Brapi ${brapiRes.status}: ${await brapiRes.text()}`);
    }

    const brapiJson = await brapiRes.json();

    const brapiAssets =
      brapiJson?.results?.map((a: any) => ({
        symbol: a.symbol,
        price: a.regularMarketPrice,
        source: "Brapi.dev",
      })) || [];

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
