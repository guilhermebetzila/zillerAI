import { NextResponse } from "next/server";

// evita cache em Edge/Node
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const apiKey =
      process.env.EXCONVERT_API_KEY || process.env.NEXT_PUBLIC_EXCONVERT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da ExConvert não encontrada nas envs" },
        { status: 500 }
      );
    }

    // ✅ endpoint correto da ExConvert
    const url = `https://api.exconvert.com/convert?access_key=${apiKey}&from=USD&to=BRL&amount=1`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ExConvert ${res.status}: ${text}`);
    }

    const json = await res.json();

    // ✅ tenta encontrar a cotação em diferentes formatos
    const raw =
      json?.result?.BRL ??
      json?.result ??
      json?.rate ??
      json?.info?.rate ??
      null;

    const price =
      typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);

    if (!price || Number.isNaN(price)) {
      throw new Error("Preço inválido recebido da ExConvert");
    }

    return NextResponse.json({
      symbol: "USD/BRL",
      price,
      updated: new Date().toISOString(),
      source: "ExConvert",
    });
  } catch (error) {
    console.error("Erro /api/market:", error);
    return NextResponse.json(
      { error: "Erro ao buscar cotação" },
      { status: 500 }
    );
  }
}
