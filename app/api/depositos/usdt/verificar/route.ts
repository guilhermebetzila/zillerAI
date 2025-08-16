// app/api/depositos/usdt/verificar/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";

// RPC da BSC (pode usar sua URL privada para mais confiabilidade)
const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
// USDT (BEP-20) na BNB Smart Chain
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";
// Decimais do USDT na BSC (contrato acima)
const DECIMALS = 18;

// ABI mínimo para decodificar Transfer
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const iface = new ethers.Interface(ERC20_ABI);

export async function POST(req: Request) {
  try {
    const { hash, valor } = await req.json().catch(() => ({} as any));

    if (!hash || typeof hash !== "string") {
      return NextResponse.json(
        { error: "Parâmetro inválido: 'hash' é obrigatório." },
        { status: 400 }
      );
    }

    // Busca o recibo da transação
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

    // Procura logs do contrato do USDT
    const usdtLogs = receipt.logs.filter(
      (l) => (l.address || "").toLowerCase() === USDT_BEP20.toLowerCase()
    );
    if (usdtLogs.length === 0) {
      return NextResponse.json(
        { error: "Transação não é uma transferência de USDT (contrato inválido)." },
        { status: 400 }
      );
    }

    // Decodifica o primeiro Transfer válido (se houver vários, tratamos o primeiro)
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
      } catch {
        // ignora logs que não decodificam
      }
    }

    if (!decoded) {
      return NextResponse.json(
        { error: "Não foi possível decodificar evento Transfer de USDT." },
        { status: 400 }
      );
    }

    const toAddr = decoded.to.toLowerCase();
    const amount = Number(ethers.formatUnits(decoded.value, DECIMALS));
    const amountStr = amount.toString(); // Para campos Decimal do Prisma

    // Evita duplicidade
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

    // Tenta vincular a um usuário pela carteira
    const user = await prisma.user.findUnique({
      where: { carteira: toAddr },
      select: { id: true, email: true },
    });

    // Registra atômico: onChain + (se houver user) deposito + saldo
    if (user) {
      const [onchain] = await prisma.$transaction([
        prisma.onChainDeposit.create({
          data: {
            txHash: hash,
            from: decoded.from.toLowerCase(),
            to: toAddr,
            amount: amountStr, // Decimal: string
            userId: user.id,
            status: "confirmado", // já confirmamos
          },
        }),
        prisma.deposito.create({
          data: {
            userId: user.id,
            valor: amountStr, // Decimal: string
            status: "confirmado",
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { saldo: { increment: amountStr } }, // Decimal: string
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message: "Depósito USDT confirmado e creditado.",
        amount,
        txHash: hash,
        userId: user.id,
        onchainId: onchain.id,
        observacao:
          typeof valor === "number" && Math.abs(valor - amount) > 0.000001
            ? "Valor informado difere do valor on-chain; foi usado o valor real da blockchain."
            : undefined,
      });
    } else {
      // Sem usuário: salva pendente para posterior vinculação
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
          "Transação de USDT registrada como pendente: nenhuma carteira de usuário corresponde ao destinatário. Vincule a carteira ao usuário para creditar.",
        amount,
        txHash: hash,
        onchainId: onchain.id,
      });
    }
  } catch (err) {
    console.error("❌ Erro ao verificar transação USDT:", err);
    return NextResponse.json(
      { error: "Erro interno ao verificar transação." },
      { status: 500 }
    );
  }
}
