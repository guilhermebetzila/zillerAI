import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export async function GET() {
  try {
    console.log("🔍 Iniciando busca de saldo...");
    
    const session = await getServerSession(authOptions); // ✅ CORRIGIDO: authOptions
    
    console.log("📋 Sessão encontrada:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id) {
      console.log("❌ Usuário não autenticado");
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    console.log("👤 Buscando usuário ID:", userId);
    
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        saldo: true, 
        valorInvestido: true,
        email: true,
        nome: true // ✅ CORRIGIDO: 'nome' em vez de 'name'
      },
    });

    if (!usuario) {
      console.log("❌ Usuário não encontrado no banco");
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    console.log("✅ Saldo encontrado:", {
      saldo: usuario.saldo,
      valorInvestido: usuario.valorInvestido,
      email: usuario.email,
      nome: usuario.nome // ✅ CORRIGIDO: 'nome' em vez de 'name'
    });
    
    return NextResponse.json({
      saldo: usuario.saldo,
      valorInvestido: usuario.valorInvestido || 0,
    });
  } catch (error) {
    console.error("💥 Erro completo ao buscar saldo:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar saldo" },
      { status: 500 }
    );
  }
}