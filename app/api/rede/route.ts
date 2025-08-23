import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export type UsuarioArvore = {
  id: number;
  nome: string | null;
  email: string;
  quantidadeDiretos: number;
  indicados: UsuarioArvore[];
};

async function carregarArvore(userId: number): Promise<UsuarioArvore | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { indicados: true },
  });

  if (!user) return null;

  const filhos = await Promise.all(
    user.indicados.map((ind) => carregarArvore(ind.id))
  );

  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    quantidadeDiretos: user.indicados.length,
    indicados: filhos.filter((f): f is UsuarioArvore => f !== null),
  };
}

function contarDiretosEIndiretos(arvore: UsuarioArvore | null) {
  if (!arvore) return { diretos: 0, indiretos: 0 };

  const diretos = arvore.indicados.length;

  // pega todos os nós descendentes (recursivo)
  function contarIndiretos(nodes: UsuarioArvore[]): number {
    return nodes.reduce((acc, node) => {
      return acc + 1 + contarIndiretos(node.indicados);
    }, 0);
  }

  const totalDescendentes = contarIndiretos(arvore.indicados);

  return {
    diretos,
    indiretos: totalDescendentes - diretos, // só do nível 2 em diante
  };
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const usuario = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { indicados: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const arvore = await carregarArvore(usuario.id);
    const { diretos, indiretos } = contarDiretosEIndiretos(arvore);

    return NextResponse.json({
      usuario: usuario.email,
      diretos,
      indiretos,
      arvore,
    });
  } catch (error) {
    console.error("Erro API rede:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
