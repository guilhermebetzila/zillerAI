// app/api/depositos/usdt/verificar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import axios from "axios";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";
const API_URL = "https://api.bscscan.com/api";
const DECIMALS = 18;

export async function GET() {
  if (!ETHERSCAN_API_KEY) {
    console.error("❌ ETHERSCAN_API_KEY não configurada no .env");
    return NextResponse.json(
      { error: "Configuração ausente (ETHERSCAN_API_KEY)" },
      { status: 500 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      where: { carteira: { not: null } },
    });

    for (const user of users) {
      if (!user.carteira) continue;

      let data: any;
      try {
        const res = await axios.get(API_URL, {
          params: {
            module: "account",
            action: "tokentx",
            address: user.carteira,
            contractaddress: USDT_CONTRACT,
            sort: "desc",
            apikey: ETHERSCAN_API_KEY,
          },
          timeout: 10000,
        });
        data = res.data;
      } catch (err) {
        console.error(`⚠️ Erro API para user ${user.id}:`, err);
        continue;
      }

      if (!data || data.status !== "1" || !Array.isArray(data.result)) {
        console.warn(`⚠️ Nenhuma transação válida para carteira ${user.carteira}`);
        continue;
      }

      for (const tx of data.result) {
        try {
          if (!tx?.to || !tx?.hash) continue;
          if (tx.to.toLowerCase() !== user.carteira.toLowerCase()) continue;

          const txHash = tx.hash;
          const existe = await prisma.onChainDeposit.findUnique({ where: { txHash } });
          if (existe) continue;

          const rawValue = BigInt(tx.value);
          const amount = Number(rawValue) / Math.pow(10, DECIMALS);
          if (amount <= 0) continue;

          await prisma.onChainDeposit.create({
            data: {
              txHash,
              from: tx.from || "desconhecido",
              to: tx.to,
              amount,
              userId: user.id,
              status: "pendente",
            },
          });

          console.log(`💰 Depósito pendente detectado: ${amount} USDT para user ${user.id}`);
        } catch (err) {
          console.error(`❌ Erro tx ${tx?.hash || "??"} user ${user.id}:`, err);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Erro geral ao verificar depósitos:", error);
    return NextResponse.json(
      { error: "Erro ao verificar depósitos" },
      { status: 500 }
    );
  }
}
