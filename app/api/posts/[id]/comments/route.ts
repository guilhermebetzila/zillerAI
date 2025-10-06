// app/api/posts/[id]/comments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const postId = Number(params.id);
    if (Number.isNaN(postId)) {
      return NextResponse.json(
        { ok: false, error: 'postId inválido' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, nome: true, photoUrl: true } },
      },
    });

    return NextResponse.json({ ok: true, comments });
  } catch (err) {
    console.error('GET /api/posts/[id]/comments error:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar comentários' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const postId = Number(params.id);
    if (Number.isNaN(postId)) {
      return NextResponse.json(
        { ok: false, error: 'postId inválido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const anonName =
      typeof body.anonName === 'string' ? body.anonName.trim() : undefined;

    if (!content) {
      return NextResponse.json(
        { ok: false, error: 'Conteúdo obrigatório' },
        { status: 400 }
      );
    }

    // tenta pegar sessão (se houver). Faz cast para Session|null pra evitar erro de typing
    const session = (await getServerSession(authOptions as any)) as Session | null;

    // Se tiver sessão, procuramos o user no banco via email (se o id não estiver presente)
    let userId: number | null = null;
    try {
      if (session?.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (dbUser) userId = dbUser.id;
      }
    } catch (e) {
      console.warn('Erro ao buscar user pelo email da sessão', e);
    }

    const created = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: userId ?? undefined,
        anonName: userId ? null : anonName || 'Visitante',
      },
      include: {
        user: { select: { id: true, nome: true, photoUrl: true } },
      },
    });

    return NextResponse.json({ ok: true, comment: created }, { status: 201 });
  } catch (err) {
    console.error('POST /api/posts/[id]/comments error:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar comentário' },
      { status: 500 }
    );
  }
}
