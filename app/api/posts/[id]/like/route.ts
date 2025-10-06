import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@lib/auth';
import type { Session } from 'next-auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const postId = Number(params.id);
    if (Number.isNaN(postId)) {
      return NextResponse.json(
        { ok: false, error: 'ID do post inválido' },
        { status: 400 }
      );
    }

    // Pega a sessão (se o usuário estiver logado)
    const session = (await getServerSession(authOptions as any)) as Session | null;

    // Busca o ID real do user no banco pelo e-mail
    let userId: number | null = null;
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) userId = dbUser.id;
    }

    // Tenta criar o like (se já existir, remove — comportamento tipo “toggle”)
    const existingLike = await prisma.like.findFirst({
      where: { postId, userId: userId ?? undefined },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({
        data: {
          postId,
          userId: userId ?? undefined,
        },
      });
    }

    // Conta total de likes atualizados
    const likes = await prisma.like.count({ where: { postId } });

    return NextResponse.json({ ok: true, likes });
  } catch (err) {
    console.error('Erro ao curtir:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro ao curtir' },
      { status: 500 }
    );
  }
}
