import { NextResponse } from "next/server";
import "dotenv/config";
import https from "https";
import fs from "fs";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// 🔹 Certificado e credenciais obrigatórias
const certPath = process.env.EFI_CERT_P12_PATH!;
const certPassword = process.env.EFI_CERT_PASSWORD || "";
const payerKey = process.env.EFI_PAYER_PIX_KEY!;
const clientId = process.env.EFI_CLIENT_ID!;
const clientSecret = process.env.EFI_CLIENT_SECRET!;
const baseUrl = process.env.EFI_BASE_URL || "https://pix.api.efipay.com.br";

// 🔹 Verifica se o certificado existe
if (!fs.existsSync(certPath)) throw new Error(`❌ Certificado P12 não encontrado: ${certPath}`);

// 🔹 Cria HTTPS Agent com mTLS
const pfxBuffer = fs.readFileSync(certPath);
const httpsAgent = new https.Agent({ pfx: pfxBuffer, passphrase: certPassword || undefined });

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export async function POST(req: Request) {
  try {
    const { userId, valor, metodo, chavePix, carteiraUsdt } = await req.json();

    // 🔹 Validações básicas
    const valorNumber = Number(valor);
    if (!valorNumber || valorNumber <= 0) throw new Error("Valor inválido");

    const chavePixTrimmed = chavePix?.trim() || "";
    const carteiraUsdtTrimmed = carteiraUsdt?.trim() || "";

    if (metodo === "PIX" && !chavePixTrimmed) throw new Error("Chave PIX inválida");
    if (metodo === "USDT" && !carteiraUsdtTrimmed) throw new Error("Carteira USDT inválida");

    // 🔹 Consulta usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (Number(user.saldo) < valorNumber) return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

    // 🔹 Bloqueia saldo para saque
    await prisma.user.update({
      where: { id: userId },
      data: { saldo: Number(user.saldo) - valorNumber },
    });

    // 🔹 Obtem token OAuth Efí
    const tokenResp = await axios.post<TokenResponse>(
      `${baseUrl}/oauth/token`,
      "grant_type=client_credentials&scope=pix.write",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
        auth: { username: clientId, password: clientSecret },
      }
    );

    const accessToken = tokenResp.data.access_token;

    // 🔹 Cria pagamento PIX (se método PIX)
    let txId: string | null = null;
    if (metodo === "PIX") {
      const pixResp = await axios.post(
        `${baseUrl}/v2/pix/${payerKey}/cob`,
        { chave: chavePixTrimmed, valor: valorNumber, infoAdicional: "Saque plataforma" },
        { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, httpsAgent }
      );
      txId = pixResp.data.txid || null;
    }

    // 🔹 Salva saque no banco
    await prisma.saque.create({
      data: {
        userId,
        valor: valorNumber,
        tipo: metodo,
        chavePix: metodo === "PIX" ? chavePixTrimmed : null,
        status: "processando", // ⚡ compatível com o enum atual
        criadoEm: new Date(),
        txHash: txId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Erro ao processar saque:", err.message || err);
    return NextResponse.json({ error: err.message || "Erro desconhecido" }, { status: 500 });
  }
}
