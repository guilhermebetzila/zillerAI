import { NextResponse } from 'next/server';
import prisma from '@lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const take = Number(url.searchParams.get('take') ?? '12');
    const skip = page * take;

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            nome: true,        // ✅ campo correto do seu modelo
            photoUrl: true,    // ✅ campo correto de imagem
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, posts });
  } catch (err) {
    console.error('❌ Erro no GET /posts:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, imageUrl, anonName, tipo } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Conteúdo obrigatório' },
        { status: 400 }
      );
    }

    let authorId: number | null = null;

    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (user) authorId = user.id;
      }
    } catch (e) {
      console.warn('⚠️ Nenhuma sessão de usuário encontrada');
    }

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || null,
        anonName: authorId ? null : anonName || 'Visitante',
        authorId,
        tipo: tipo || 'trader',
      },
      include: {
        author: {
          select: {
            id: true,
            nome: true,       // ✅ campo correto
            photoUrl: true,   // ✅ campo correto de imagem
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (err) {
    console.error('❌ Erro no POST /posts:', err);
    return NextResponse.json(
      { ok: false, error: 'Erro ao criar post' },
      { status: 500 }
    );
  }
}
