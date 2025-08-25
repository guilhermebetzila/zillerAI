import { NextResponse } from "next/server";
import "dotenv/config";
import https from "https";
import axios from "axios";
import { prisma } from "@/lib/prisma";

// 🔹 Base64 do certificado P12 (Vercel)
const certBase64 = process.env.EFI_CERT_P12_BASE64!;
const pfxBuffer = Buffer.from(certBase64, "base64");

// 🔹 Credenciais e URL
const certPassword = process.env.EFI_CERT_PASSWORD || "";
const payerKey = process.env.EFI_PAYER_PIX_KEY!;
const clientId = process.env.EFI_CLIENT_ID!;
const clientSecret = process.env.EFI_CLIENT_SECRET!;
const baseUrl = process.env.EFI_BASE_URL || "https://pix.api.efipay.com.br";

// 🔹 HTTPS Agent com mTLS
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

    if (!valor || valor <= 0) throw new Error("Valor inválido");
    if (metodo === "PIX" && !chavePix) throw new Error("Chave PIX inválida");
    if (metodo === "USDT" && !carteiraUsdt) throw new Error("Carteira USDT inválida");

    // Consulta usuário
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (user.saldo < valor) return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

    // Bloqueia saldo
    await prisma.user.update({
      where: { id: userId },
      data: { saldo: Number(user.saldo) - Number(valor) },
    });

    // Obtem token OAuth Efí
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

    let txId: string | null = null;

    if (metodo === "PIX") {
      try {
        const pixResp = await axios.post(
          `${baseUrl}/v2/pix/${payerKey}/cob`,
          { chave: chavePix.trim(), valor: Number(valor), infoAdicional: "Saque plataforma" },
          { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, httpsAgent }
        );
        txId = pixResp.data.txid || null;
      } catch (pixErr: any) {
        console.error("❌ Erro PIX:", pixErr.response?.data || pixErr.message);
        return NextResponse.json({ error: "Erro ao criar pagamento PIX. Verifique chave e valor." }, { status: 400 });
      }
    }

    // Salva saque no banco
    await prisma.saque.create({
      data: {
        userId,
        valor: Number(valor),
        tipo: metodo,
        chavePix: metodo === "PIX" ? chavePix.trim() : null,
        status: "processando",
        criadoEm: new Date(),
        txHash: txId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Erro ao processar saque:", err.response?.data || err.message || err);
    return NextResponse.json({ error: err.message || "Erro desconhecido" }, { status: 500 });
  }
}
