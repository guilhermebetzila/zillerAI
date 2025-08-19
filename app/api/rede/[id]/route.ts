import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LinhaRede = {
  id: number;
  nome: string;
  indicadoPorId: number | null;
  nivel: number;
};

type UsuarioComFilhos = {
  id: number;
  nome: string;
  indicadoPorId: number | null;
  nivel: number;
  filhos: UsuarioComFilhos[];
};

function construirArvore(lista: LinhaRede[]): UsuarioComFilhos {
  const mapa = new Map<number, UsuarioComFilhos>();

  lista.forEach((u) => {
    mapa.set(u.id, { ...u, filhos: [] });
  });

  let raiz: UsuarioComFilhos | null = null;

  lista.forEach((u) => {
    if (u.indicadoPorId === null) {
      raiz = mapa.get(u.id)!;
    } else {
      const pai = mapa.get(u.indicadoPorId);
      if (pai) {
        pai.filhos.push(mapa.get(u.id)!);
      }
    }
  });

  return raiz!;
}

export async function GET(req: NextRequest) {
  // extrair o id da URL: /api/rede/[id]
  const { pathname } = new URL(req.url);
  const parts = pathname.split("/");
  const usuarioId = Number(parts[parts.length - 1]);

  if (!Number.isInteger(usuarioId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const rede = await prisma.$queryRaw<LinhaRede[]>`
      WITH RECURSIVE rede AS (
        SELECT id, nome, "indicadoPorId", 0 AS nivel
        FROM "User"
        WHERE id = ${usuarioId}

        UNION ALL

        SELECT u.id, u.nome, u."indicadoPorId", r.nivel + 1
        FROM "User" u
        INNER JOIN rede r ON u."indicadoPorId" = r.id
      )
      SELECT * FROM rede
      ORDER BY nivel, id;
    `;

    const arvore = construirArvore(rede);

    return NextResponse.json(arvore);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao consultar a rede" },
      { status: 500 }
    );
  }
}
