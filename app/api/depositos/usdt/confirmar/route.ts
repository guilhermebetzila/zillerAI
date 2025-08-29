// app/api/depositos/usdt/confirmar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";
import { ethers } from "ethers";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/[...nextauth]/authOptions";

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
    // 🔐 precisa estar logado
    const session = await getServerSession(authOptions);
    const currentUserIdRaw = (session?.user as any)?.id || null;
    const currentUserId = currentUserIdRaw ? Number(currentUserIdRaw) : null;

    if (!currentUserId) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
    }
    if (!MAIN_WALLET) {
      return NextResponse.json({ error: "MAIN_WALLET não configurada." }, { status: 500 });
    }

    // 📥 body
    const { hash } = await req.json().catch(() => ({} as any));
    if (!hash || typeof hash !== "string") {
      return NextResponse.json({ error: "Parâmetro inválido: 'hash' é obrigatório." }, { status: 400 });
    }

    // 🔎 receipt on-chain
    const receipt = await provider.getTransactionReceipt(hash);
    if (!receipt) {
      return NextResponse.json({ error: "Transação não encontrada ou pendente." }, { status: 404 });
    }
    if (receipt.status !== 1) {
      return NextResponse.json({ error: "Transação falhou na blockchain." }, { status: 400 });
    }

    // 🔍 procura logs do contrato USDT
    const usdtLogs = receipt.logs.filter(
      (l) => (l.address || "").toLowerCase() === USDT_BEP20.toLowerCase()
    );
    if (usdtLogs.length === 0) {
      return NextResponse.json({ error: "Transação não é de USDT (contrato incorreto)." }, { status: 400 });
    }

    // 🧩 decodifica Transfer
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
      } catch {
        // continua tentando nos próximos logs
      }
    }
    if (!decoded) {
      return NextResponse.json({ error: "Não foi possível decodificar o evento Transfer." }, { status: 400 });
    }

    const toAddr = decoded.to.toLowerCase();
    if (toAddr !== MAIN_WALLET) {
      return NextResponse.json(
        { error: "Transação não foi enviada para a MAIN_WALLET do sistema." },
        { status: 400 }
      );
    }

    const amount = Number(ethers.formatUnits(decoded.value, DECIMALS));
    const amountStr = amount.toString();

    // 🚫 evita duplicidade por txHash
    const existente = await prisma.onChainDeposit.findUnique({ where: { txHash: hash } });

    // 🧾 transação atômica
    if (!existente) {
      // primeira vez que vemos esse hash → cria registro, cria depósito contábil e credita saldo
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
            metodo: "usdt",
          },
        }),
        prisma.user.update({
          where: { id: currentUserId },
          data: { saldo: { increment: amount } },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message: "Depósito confirmado e creditado.",
        amount,
        txHash: hash,
        userId: currentUserId,
        onchainId: onchain.id,
      });
    } else {
      // já existe registro desse hash
      if (existente.status === "confirmado") {
        return NextResponse.json({
          ok: true,
          message: "Transação já estava confirmada anteriormente.",
          deposito: existente,
        });
      }

      // status ainda não confirmado → confirma e credita saldo
      const updated = await prisma.$transaction(async (tx) => {
        const up = await tx.onChainDeposit.update({
          where: { id: existente.id },
          data: {
            status: "confirmado",
            userId: existente.userId ?? currentUserId,
          },
        });

        await tx.user.update({
          where: { id: existente.userId ?? currentUserId },
          data: { saldo: { increment: amount } },
        });

        return up;
      });

      return NextResponse.json({
        ok: true,
        message: "Depósito confirmado e creditado.",
        amount,
        txHash: hash,
        userId: updated.userId,
        onchainId: updated.id,
      });
    }
  } catch (err) {
    console.error("❌ Erro ao confirmar depósito:", err);
    return NextResponse.json(
      { error: "Erro interno ao confirmar depósito." },
      { status: 500 }
    );
  }
}
