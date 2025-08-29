// app/api/rede/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions"; // caminho relativo
import { prisma } from "../../../lib/prisma"; // caminho ajustado para lib/prisma.ts

export type UsuarioArvore = {
  id: number;
  nome: string | null;
  email: string;
  quantidadeDiretos: number;
  indicados: UsuarioArvore[];
};

// 🔁 Função recursiva para montar a árvore
async function carregarArvore(userId: number): Promise<UsuarioArvore | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { indicados: true },
  });

  if (!user) return null;

  const filhos = await Promise.all(
    user.indicados.map((ind: { id: number }) => carregarArvore(ind.id))
  );

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    quantidadeDiretos: user.indicados.length,
    indicados: filhos.filter((f): f is UsuarioArvore => f !== null),
  };
}

// 📊 Contador de diretos e indiretos corrigido
function contarDiretosEIndiretos(arvore: UsuarioArvore | null) {
  if (!arvore) return { diretos: 0, indiretos: 0 };

  const diretos = arvore.indicados.length;

  function contarTodosIndiretos(nodes: UsuarioArvore[]): number {
    return nodes.reduce((acc, node) => {
      return acc + node.indicados.length + contarTodosIndiretos(node.indicados);
    }, 0);
  }

  const totalIndiretos = contarTodosIndiretos(arvore.indicados);

  return {
    diretos,
    indiretos: totalIndiretos,
  };
}

// 🚀 Rota GET /api/rede
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { indicados: true },
    });

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const arvore = await carregarArvore(usuario.id);
    const { diretos, indiretos } = contarDiretosEIndiretos(arvore);

    const pontosDiretos = diretos * 5;
    const pontosIndiretos = indiretos * 5;
    const pontosTotais = pontosDiretos + pontosIndiretos;

    return NextResponse.json({
      usuario: usuario.email,
      diretos,
      indiretos,
      pontosDiretos,
      pontosIndiretos,
      pontosTotais,
      arvore,
    });
  } catch (error) {
    console.error("Erro API rede:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
