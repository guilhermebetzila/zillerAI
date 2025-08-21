import { NextResponse } from "next/server";

// evita cache em Edge/Node
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // funciona com EXCONVERT_API_KEY ou NEXT_PUBLIC_EXCONVERT_API_KEY
    const apiKey =
      process.env.EXCONVERT_API_KEY || process.env.NEXT_PUBLIC_EXCONVERT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da ExConvert não encontrada nas envs" },
        { status: 500 }
      );
    }

    // exemplo fixo USD->BRL
    const url = `https://api.exconvert.com/convert?de=USD&para=BRL&quantia=1&chave=${apiKey}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ExConvert ${res.status}: ${text}`);
    }

    const json = await res.json();
    // A API pode retornar:
    // {
    //   "base":"USD","valor":"1",
    //   "resultado":{"BRL":5.42,"taxa":5.42}
    // }
    // ou:
    // {
    //   "base":"BRL","valor":"11.5",
    //   "resultado":{"USD":2.09,"taxa":0.18}
    // }

    const raw =
      json?.resultado?.BRL ??
      json?.resultado?.USD ??
      json?.resultado?.taxa ??
      json?.taxa ??
      null;

    const price =
      typeof raw === "string" ? parseFloat(raw.replace(",", ".")) : Number(raw);

    if (!price || Number.isNaN(price)) {
      throw new Error("Preço inválido recebido da ExConvert");
    }

    return NextResponse.json({
      symbol: `${json?.base}/${
        json?.resultado?.BRL ? "BRL" : json?.resultado?.USD ? "USD" : "?"
      }`,
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
