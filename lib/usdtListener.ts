// lib/usdtListener.ts
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const RPC_URL = process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// USDT (BEP-20) na BNB Smart Chain
const USDT_BEP20 = "0x55d398326f99059fF775485246999027B3197955";

// ABI mínimo para o evento Transfer(address,address,uint256)
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

let started = false;

export function startUSDTListener() {
  if (started) return;
  started = true;

  const contract = new ethers.Contract(USDT_BEP20, ERC20_ABI, provider);

  console.log("👂 Escutando depósitos de USDT (BEP-20) na BSC…");
  console.log(`➡️  RPC: ${RPC_URL}`);

  contract.on("Transfer", async (from, to, value, event) => {
    try {
      // USDT na BSC tem 18 casas decimais
      const amount = new Decimal(ethers.formatUnits(value, 18));
      const txHash = event.log?.transactionHash;

      if (!txHash) {
        console.warn("⚠️ Evento sem txHash, ignorado.");
        return;
      }

      console.log(
        `💰 Depósito detectado: ${amount} USDT | de ${from} → ${to} | tx: ${txHash}`
      );

      // ⚡ Evitar duplicados
      const exists = await prisma.onChainDeposit.findUnique({
        where: { txHash },
      });
      if (exists) {
        console.log("⏩ Depósito já registrado, ignorando.");
        return;
      }

      // 👉 Buscar usuário pela carteira (apenas se carteira não for vazia)
      let user = null;
      if (to) {
        user = await prisma.user.findUnique({
          where: { carteira: to.toLowerCase() },
        });
      }

      // Registrar OnChainDeposit
      await prisma.onChainDeposit.create({
        data: {
          txHash,
          from: from.toLowerCase(),
          to: to.toLowerCase(),
          amount,
          userId: user?.id ?? null,
        },
      });

      if (user) {
        // Registrar também em Deposito
        await prisma.deposito.create({
          data: {
            valor: amount,
            userId: user.id,
          },
        });

        // Atualizar saldo
        await prisma.user.update({
          where: { id: user.id },
          data: { saldo: { increment: amount } },
        });

        console.log(`✅ Depósito vinculado ao usuário ${user.email} (ID: ${user.id})`);
      } else {
        console.log("⚠️ Nenhum usuário encontrado para esta carteira.");
      }
    } catch (e) {
      console.error("❌ Erro ao processar evento USDT:", e);
    }
  });
}
