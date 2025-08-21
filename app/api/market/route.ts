import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.EXCONVERT_API_KEY;
    const url = `https://api.exconvert.com/convert?de=USD&para=BRL&quantia=1&chave=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json({
      symbol: "USD/BRL",
      price: data.resultado.BRL,
      updated: new Date().toISOString(),
      source: "ExConvert",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar cotação" },
      { status: 500 }
    );
  }
}
