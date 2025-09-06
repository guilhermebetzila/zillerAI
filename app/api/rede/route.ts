// app/api/rede/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions"; 
import { prisma } from "../../../lib/prisma";

// Tipo da árvore do usuário
export type UsuarioArvore = {
  id: number;
  nome: string | null;
  email: string;
  valorInvestido: number;
  indicados: UsuarioArvore[];
};

// 🔁 Função recursiva para montar a árvore completa
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
    valorInvestido: Number(user.valorInvestido ?? 0),
    indicados: filhos.filter((f): f is UsuarioArvore => f !== null),
  };
}

// 📊 Função recursiva para calcular pontos indiretos (todos os níveis abaixo)
function calcularPontosIndiretos(indicados: UsuarioArvore[]): number {
  let total = 0;
  for (const ind of indicados) {
    // 5 pontos fixos + pontos por investimento
    total += 5 + Math.floor(ind.valorInvestido / 2);
    if (ind.indicados.length > 0) {
      total += calcularPontosIndiretos(ind.indicados);
    }
  }
  return total;
}

// 📊 Função recursiva para contar todos os indiretos
function contarIndiretos(indicados: UsuarioArvore[]): number {
  let total = 0;
  for (const ind of indicados) {
    total += 1; // conta o próprio indicado
    if (ind.indicados.length > 0) {
      total += contarIndiretos(ind.indicados);
    }
  }
  return total;
}

// 📊 Função principal para calcular pontos diretos e indiretos + quantidade
function calcularPontos(arvore: UsuarioArvore | null) {
  if (!arvore) return { pontosDiretos: 0, pontosIndiretos: 0, pontosTotais: 0, diretos: 0, indiretos: 0 };

  // Pontos dos indicados diretos (primeiro nível)
  let pontosDiretos = 0;
  for (const direto of arvore.indicados) {
    pontosDiretos += 5 + Math.floor(direto.valorInvestido / 2);
  }

  // Pontos dos indiretos (todos os níveis abaixo dos diretos)
  const pontosIndiretos = calcularPontosIndiretos(arvore.indicados);

  // Quantidade de diretos e indiretos
  const diretos = arvore.indicados.length;
  const indiretos = contarIndiretos(arvore.indicados);

  return {
    pontosDiretos,
    pontosIndiretos,
    pontosTotais: pontosDiretos + pontosIndiretos,
    diretos,
    indiretos,
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

    // Monta árvore completa do usuário
    const arvore = await carregarArvore(usuario.id);

    // Calcula pontos híbridos + quantidade de pessoas
    const { pontosDiretos, pontosIndiretos, pontosTotais, diretos, indiretos } = calcularPontos(arvore);

    return NextResponse.json({
      usuario: usuario.email,
      pontosDiretos,
      pontosIndiretos,
      pontosTotais,
      diretos,
      indiretos,
      arvore,
    });
  } catch (error) {
    console.error("Erro API rede:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
