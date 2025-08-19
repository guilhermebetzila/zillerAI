import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: {
        id: true,
        saldo: true,
        valorInvestido: true,
        pontos: true, // pontos base do usuário
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Indicados diretos (1º nível)
    const indicadosDiretos = await prisma.user.count({
      where: { indicadoPorId: user.id },
    });

    // Buscar IDs dos diretos para calcular indiretos (2º nível)
    const idsDiretos = await prisma.user.findMany({
      where: { indicadoPorId: user.id },
      select: { id: true },
    });
    const idsDiretosArray = idsDiretos.map(u => u.id);

    // Indicados indiretos (2º nível)
    let indicadosIndiretos = 0;
    if (idsDiretosArray.length > 0) {
      indicadosIndiretos = await prisma.user.count({
        where: { indicadoPorId: { in: idsDiretosArray } },
      });
    }

    // Calcular pontos: 1 por direto, 1 por indireto
    const pontosDiretos = indicadosDiretos * 1;
    const pontosIndiretos = indicadosIndiretos * 1;
    const pontosTotais = user.pontos + pontosDiretos + pontosIndiretos;

    return NextResponse.json({
      saldo: user.saldo,
      valorInvestido: user.valorInvestido,
      pontos: pontosTotais,
      pontosDiretos,
      pontosIndiretos,
      totalIndicados: indicadosDiretos + indicadosIndiretos,
    });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
