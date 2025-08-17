// app/api/depositos/usdt/verificar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";
import { getServerSession } from "next-auth"; // 👈 pegar usuário logado no servidor
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"; // ajuste o path se o seu for diferente

const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
// USDT (BEP-20) na BNB Smart Chain
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
// ATENÇÃO: na BSC, USDT tem 18 decimais no contrato acima.
// (Se o seu contrato oficial usar 18, mantenha. Se usar 6, mude aqui.)
const DECIMALS = 18;

// carteira da EMPRESA (destino)
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

    // Filtra logs do contrato do USDT
    const usdtLogs = receipt.logs.filter(
      (l) => (l.address || "").toLowerCase() === USDT_BEP20.toLowerCase()
    );
    if (usdtLogs.length === 0) {
      return NextResponse.json(
        { error: "Transação não é uma transferência de USDT (contrato inválido)." },
        { status: 400 }
      );
    }

    // Decodifica o primeiro Transfer
    let decoded: { from: string; to: string; value: bigint } | undefined;
    for (const log of usdtLogs) {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data as string,
        });
        if (parsed?.name === "Transfer") {
          const from = (parsed.args.from as string) || "";
          const to = (parsed.args.to as string) || "";
          const value = parsed.args.value as bigint;
          decoded = { from, to, value };
          break;
        }
      } catch {}
    }
    if (!decoded) {
      return NextResponse.json(
        { error: "Não foi possível decodificar evento Transfer de USDT." },
        { status: 400 }
      );
    }

    const toAddr = decoded.to.toLowerCase();
    const amount = Number(ethers.formatUnits(decoded.value, DECIMALS));
    const amountStr = amount.toString();

    // evitar duplicidade
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

    // 1) Caso "endereço do usuário" (se você tiver usuários com carteira própria salva)
    const userByWallet =
      await prisma.user.findUnique({
        where: { carteira: toAddr },
        select: { id: true, email: true },
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
          data: { saldo: { increment: amountStr } },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message: "Depósito USDT confirmado e creditado (carteira do usuário).",
        amount,
        txHash: hash,
        userId: userByWallet.id,
        onchainId: onchain.id,
        observacao:
          typeof valor === "number" && Math.abs(valor - amount) > 0.000001
            ? "Valor informado difere do valor on-chain; foi usado o valor real."
            : undefined,
      });
    }

    // 2) Caso "carteira da EMPRESA": creditar o usuário logado
    if (MAIN_WALLET && toAddr === MAIN_WALLET) {
      if (!currentUserId) {
        // sem sessão → salva pendente para posterior vinculação manual
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
            "Pagamento recebido na carteira da empresa, mas sem usuário logado. Registro pendente.",
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
          data: { saldo: { increment: amountStr } },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message:
          "Depósito USDT confirmado e creditado (carteira da empresa + usuário logado).",
        amount,
        txHash: hash,
        userId: currentUserId,
        onchainId: onchain.id,
      });
    }

    // 3) Outro destino → pendente (para investigação)
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
        "Transação registrada como pendente (destinatário não corresponde).",
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
