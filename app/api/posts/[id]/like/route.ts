// app/api/posts/[id]/like/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@lib/auth';
import type { Session } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    // Pega o ID do post diretamente da URL
    const postIdStr = req.nextUrl.pathname.split('/').pop();
    const postId = Number(postIdStr);

    if (Number.isNaN(postId)) {
      return NextResponse.json({ ok: false, error: 'ID do post inválido' }, { status: 400 });
    }

    // Pega a sessão (se o usuário estiver logado)
    const session = (await getServerSession(authOptions as any)) as Session | null;

    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Busca o ID real do user no banco pelo e-mail
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ ok: false, error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userId = dbUser.id;

    // Tenta criar o like (se já existir, remove — toggle)
    const existingLike = await prisma.like.findFirst({
      where: { postId, userId },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({
        data: { postId, userId },
      });
    }

    // Conta total de likes atualizados
    const likes = await prisma.like.count({ where: { postId } });

    return NextResponse.json({ ok: true, likes });
  } catch (err) {
    console.error('Erro ao curtir:', err);
    return NextResponse.json({ ok: false, error: 'Erro ao curtir' }, { status: 500 });
  }
}
