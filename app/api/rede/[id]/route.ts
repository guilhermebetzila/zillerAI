import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type LinhaRede = {
  id: number;
  nome: string;
  indicadoPorId: number | null;
  nivel: number;
};

type ResumoNivel = {
  nivel: number;
  quantidade: number;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const usuarioId = Number(params.id);
  if (!Number.isInteger(usuarioId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    // 1) Buscar rede completa
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

    // 2) Buscar resumo por nível
    const resumo = await prisma.$queryRaw<ResumoNivel[]>`
      WITH RECURSIVE rede AS (
        SELECT id, nome, "indicadoPorId", 0 AS nivel
        FROM "User"
        WHERE id = ${usuarioId}

        UNION ALL

        SELECT u.id, u.nome, u."indicadoPorId", r.nivel + 1
        FROM "User" u
        INNER JOIN rede r ON u."indicadoPorId" = r.id
      )
      SELECT nivel, COUNT(*)::int AS quantidade
      FROM rede
      GROUP BY nivel
      ORDER BY nivel;
    `;

    return NextResponse.json({
      raiz: usuarioId,
      total: Math.max(0, rede.length - 1), // todos menos o raiz
      usuarios: rede,
      resumo: resumo,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao consultar a rede' }, { status: 500 });
  }
}

