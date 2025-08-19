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

  // Cria cada nó vazio de filhos
  lista.forEach((u) => {
    mapa.set(u.id, { ...u, filhos: [] });
  });

  let raiz: UsuarioComFilhos | null = null;

  // Conecta cada nó ao seu pai
  lista.forEach((u) => {
    if (u.indicadoPorId === null) {
      raiz = mapa.get(u.id)!; // raiz encontrada
    } else {
      const pai = mapa.get(u.indicadoPorId);
      if (pai) {
        pai.filhos.push(mapa.get(u.id)!);
      }
    }
  });

  return raiz!;
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const usuarioId = Number(context.params.id);
  if (!Number.isInteger(usuarioId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // 🔹 Consulta recursiva no Postgres
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

    // 🔹 Transforma lista em árvore
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
