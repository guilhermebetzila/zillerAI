import { NextResponse } from "next/server";
import { calcularRendimentoUsuario } from "@/lib/rendimento";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Informe o userId na query" },
        { status: 400 }
      );
    }

    const rendimento = await calcularRendimentoUsuario(Number(userId));

    return NextResponse.json({
      userId: Number(userId),
      rendimento,
    });
  } catch (error) {
    console.error("Erro ao calcular rendimento do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao calcular rendimento do usuário" },
      { status: 500 }
    );
  }
}
