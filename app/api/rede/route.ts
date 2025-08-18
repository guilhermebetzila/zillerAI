import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface UsuarioComIndicados {
  id: number;
  nome: string;
  email: string;
  indicados: UsuarioComIndicados[];
}

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_aqui';

// Função recursiva para buscar toda a rede
async function buscarRede(usuarioId: number): Promise<UsuarioComIndicados> {
  const usuario = await prisma.user.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nome: true,
      email: true,
      indicados: { 
        select: { id: true, nome: true, email: true } 
      },
    },
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  const indicadosCompletos: UsuarioComIndicados[] = [];
  for (const indicado of usuario.indicados) {
    indicadosCompletos.push(await buscarRede(indicado.id));
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    indicados: indicadosCompletos,
  };
}

export async function GET() {
  try {
    // Lê o token JWT do cookie
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Busca a rede do usuário logado
    const rede = await buscarRede(decoded.id);

    return NextResponse.json(rede);
  } catch (error: any) {
    console.error('Erro ao buscar rede:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
