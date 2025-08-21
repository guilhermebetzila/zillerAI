import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ethers } from "ethers";

// ABI mínima do ERC20 para transferências
const USDT_ABI = [
  "function transfer(address to, uint amount) public returns (bool)"
];

export async function POST(req: NextRequest) {
  try {
    // 🔒 Valida sessão
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { valor, carteira } = await req.json();

    if (!valor || !carteira) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const email = session.user.email;

    // 🔎 Busca usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verifica saldo suficiente
    if (Number(user.saldo) < Number(valor)) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // --- 🔗 Configuração Blockchain ---
    const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.MAIN_PRIVATE_KEY!, provider);

    // Contrato oficial do USDT BEP20
    const USDT_CONTRACT = process.env.USDT_CONTRACT || "0x55d398326f99059fF775485246999027B3197955";
    const contract = new ethers.Contract(USDT_CONTRACT, USDT_ABI, wallet);

    // Converte valor para 6 casas decimais (USDT BEP20)
    const amount = ethers.parseUnits(String(valor), 6);

    // 🔹 Cria registro do saque como "processando"
    const saque = await prisma.saque.create({
      data: {
        userId: user.id,
        valor,
        carteira,
        status: "processando",
      },
    });

    // Envia transação
    const tx = await contract.transfer(carteira, amount);
    await tx.wait();

    // 🔹 Atualiza saque para "concluído" com hash
    await prisma.saque.update({
      where: { id: saque.id },
      data: {
        status: "concluido",
        processadoEm: new Date(),
        // txHash: tx.hash, // lembre de adicionar no modelo Saque: txHash String?
      },
    });

    // Atualiza saldo do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { saldo: { decrement: valor } },
    });

    return NextResponse.json({
      message: "✅ Saque realizado automaticamente na blockchain!",
      txHash: tx.hash,
    });

  } catch (error) {
    console.error("Erro no saque automático:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
