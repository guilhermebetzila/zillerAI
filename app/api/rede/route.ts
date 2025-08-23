import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"; // ✅ garante que pega o provider certo
import { prisma } from "@/lib/prisma";

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

// 📊 Contador de diretos e indiretos
function contarDiretosEIndiretos(arvore: UsuarioArvore | null) {
  if (!arvore) return { diretos: 0, indiretos: 0 };

  const diretos = arvore.indicados.length;

  function contarIndiretos(nodes: UsuarioArvore[]): number {
    return nodes.reduce((acc, node) => {
      return acc + 1 + contarIndiretos(node.indicados);
    }, 0);
  }

  const totalDescendentes = contarIndiretos(arvore.indicados);

  return {
    diretos,
    indiretos: totalDescendentes - diretos,
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
      arvore, // ✅ devolve a árvore completa também
    });
  } catch (error) {
    console.error("Erro API rede:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
