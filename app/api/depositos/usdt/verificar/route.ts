// app/api/depositos/usdt/verificar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";

const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
const DECIMALS = 18;

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const iface = new ethers.Interface(ERC20_ABI);

export async function POST(req: Request) {
  try {
    const { hash } = await req.json().catch(() => ({} as any));

    if (!hash || typeof hash !== "string") {
      return NextResponse.json(
        { error: "Parâmetro inválido: 'hash' é obrigatório." },
        { status: 400 }
      );
    }

    const receipt = await provider.getTransactionReceipt(hash);
    if (!receipt) {
      return NextResponse.json(
        { error: "Transação não encontrada ou ainda pendente." },
        { status: 404 }
      );
    }
    if (receipt.status !== 1) {
      return NextResponse.json(
        { error: "Transação falhou on-chain." },
        { status: 400 }
      );
    }

    // Filtra logs do contrato USDT
    const usdtLogs = receipt.logs.filter(
      (l) => (l.address || "").toLowerCase() === USDT_BEP20.toLowerCase()
    );
    if (usdtLogs.length === 0) {
      return NextResponse.json(
        { error: "Transação não é de USDT (contrato inválido)." },
        { status: 400 }
      );
    }

    // Decodifica Transfer
    let decoded: { from: string; to: string; value: bigint } | undefined;
    for (const log of usdtLogs) {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data as string,
        });
        if (parsed?.name === "Transfer") {
          decoded = {
            from: (parsed.args.from as string) || "",
            to: (parsed.args.to as string) || "",
            value: parsed.args.value as bigint,
          };
          break;
        }
      } catch {}
    }
    if (!decoded) {
      return NextResponse.json(
        { error: "Não foi possível decodificar evento Transfer." },
        { status: 400 }
      );
    }

    const toAddr = decoded.to.toLowerCase();
    const amount = Number(ethers.formatUnits(decoded.value, DECIMALS));

    // Verifica duplicidade
    const jaExiste = await prisma.onChainDeposit.findUnique({
      where: { txHash: hash },
    });
    if (jaExiste) {
      return NextResponse.json({
        ok: true,
        message: "Transação já registrada.",
        deposito: jaExiste,
      });
    }

    // Sempre registrar como pendente (manual)
    const onchain = await prisma.onChainDeposit.create({
      data: {
        txHash: hash,
        from: decoded.from.toLowerCase(),
        to: toAddr,
        amount: amount.toString(),
        userId: null, // associação será feita no /confirmar
        status: "pendente",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Transação registrada como pendente. Aguardando confirmação manual.",
      amount,
      txHash: hash,
      onchainId: onchain.id,
    });
  } catch (err) {
    console.error("❌ Erro ao verificar transação USDT:", err);
    return NextResponse.json(
      { error: "Erro interno ao verificar transação." },
      { status: 500 }
    );
  }
}
