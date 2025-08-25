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
    if (!valor || valor <= 0) throw new Error("Valor inválido");
    if (metodo === "PIX" && !chavePix) throw new Error("Chave PIX inválida");
    if (metodo === "USDT" && !carteiraUsdt) throw new Error("Carteira USDT inválida");

    // 🔹 Consulta usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (user.saldo < valor) return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

    // 🔹 Bloqueia saldo para saque
    await prisma.user.update({
      where: { id: userId },
      data: { saldo: user.saldo - valor },
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
        { chave: chavePix, valor, infoAdicional: "Saque plataforma" },
        { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, httpsAgent }
      );
      txId = pixResp.data.txid || null;
    }

    // 🔹 Salva saque no banco
    await prisma.saque.create({
      data: {
        userId,
        valor,
        tipo: metodo,
        chavePix: metodo === "PIX" ? chavePix : null,
        status: "PROCESSANDO",
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
