// app/api/depositos/usdt/verificar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
const DECIMALS = 18;
const MAIN_WALLET = (process.env.MAIN_WALLET || "").toLowerCase();

const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const iface = new ethers.Interface(ERC20_ABI);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id || null;

    const { hash, valor } = await req.json().catch(() => ({} as any));

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

    // Logs do contrato USDT
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
    const amountStr = amount.toString();

    // Evitar duplicidade
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

    // Caso 1: depósito direto na carteira do usuário
    const userByWallet = await prisma.user.findUnique({
      where: { carteira: toAddr },
      select: { id: true },
    });

    if (userByWallet) {
      const [onchain] = await prisma.$transaction([
        prisma.onChainDeposit.create({
          data: {
            txHash: hash,
            from: decoded.from.toLowerCase(),
            to: toAddr,
            amount: amountStr,
            userId: userByWallet.id,
            status: "confirmado",
          },
        }),
        prisma.deposito.create({
          data: {
            userId: userByWallet.id,
            valor: amountStr,
            status: "confirmado",
          },
        }),
        prisma.user.update({
          where: { id: userByWallet.id },
          data: { saldo: { increment: amount } },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message: "Depósito confirmado e creditado (carteira do usuário).",
        amount,
        txHash: hash,
        userId: userByWallet.id,
        onchainId: onchain.id,
      });
    }

    // Caso 2: depósito na carteira da empresa → credita usuário logado
    if (MAIN_WALLET && toAddr === MAIN_WALLET) {
      if (!currentUserId) {
        const onchain = await prisma.onChainDeposit.create({
          data: {
            txHash: hash,
            from: decoded.from.toLowerCase(),
            to: toAddr,
            amount: amountStr,
            userId: null,
            status: "pendente",
          },
        });
        return NextResponse.json({
          ok: true,
          message:
            "Pagamento recebido na carteira da empresa, mas sem usuário logado (pendente).",
          amount,
          txHash: hash,
          onchainId: onchain.id,
        });
      }

      const [onchain] = await prisma.$transaction([
        prisma.onChainDeposit.create({
          data: {
            txHash: hash,
            from: decoded.from.toLowerCase(),
            to: toAddr,
            amount: amountStr,
            userId: currentUserId,
            status: "confirmado",
          },
        }),
        prisma.deposito.create({
          data: {
            userId: currentUserId,
            valor: amountStr,
            status: "confirmado",
          },
        }),
        prisma.user.update({
          where: { id: currentUserId },
          data: { saldo: { increment: amount } },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message:
          "Depósito confirmado e creditado (empresa + usuário logado).",
        amount,
        txHash: hash,
        userId: currentUserId,
        onchainId: onchain.id,
      });
    }

    // Caso 3: outro endereço → pendente
    const onchain = await prisma.onChainDeposit.create({
      data: {
        txHash: hash,
        from: decoded.from.toLowerCase(),
        to: toAddr,
        amount: amountStr,
        userId: null,
        status: "pendente",
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Transação registrada como pendente (endereço estranho).",
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
