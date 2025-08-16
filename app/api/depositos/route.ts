import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955"; // USDT BEP20
const API_URL = "https://api.etherscan.io/v2/api"; // Multichain API

export async function GET() {
  try {
    // 🔹 Pega todos os usuários com carteira vinculada
    const users = await prisma.user.findMany({
      where: { carteira: { not: null } },
    });

    for (const user of users) {
      if (!user.carteira) continue;

      // 🔹 Busca transações na Etherscan Multichain (BNB Smart Chain = chainid 56)
      const { data } = await axios.get(API_URL, {
        params: {
          chainid: 56, // BNB Smart Chain
          module: "account",
          action: "tokentx",
          address: user.carteira,
          contractaddress: USDT_CONTRACT,
          sort: "desc",
          apikey: ETHERSCAN_API_KEY,
        },
      });

      const txs = data?.result || [];
      if (!txs.length) continue;

      for (const tx of txs) {
        // Só depósitos (to = carteira do usuário)
        if (tx.to.toLowerCase() !== user.carteira.toLowerCase()) continue;

        const txHash = tx.hash;

        // 🔹 já registrado?
        const existe = await prisma.onChainDeposit.findUnique({
          where: { txHash },
        });

        if (existe) continue;

        // 🔹 valor em USDT (18 decimais)
        const amount = Number(tx.value) / 1e18;

        // 🔹 cria registro no banco
        await prisma.onChainDeposit.create({
          data: {
            txHash,
            from: tx.from,
            to: tx.to,
            amount,
            userId: user.id,
            status: "pendente",
          },
        });

        // (Opcional) já credita no saldo
        await prisma.user.update({
          where: { id: user.id },
          data: { saldo: { increment: amount } },
        });

        console.log(`💰 Depósito detectado: ${amount} USDT de ${tx.from}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao verificar depósitos:", error);
    return NextResponse.json({ error: "Erro ao verificar depósitos" }, { status: 500 });
  }
}
