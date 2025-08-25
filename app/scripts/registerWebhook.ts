import "dotenv/config";
import https from "https";
import fs from "fs";
import axios from "axios";

// 🔹 Variáveis do .env
const payerKey = process.env.EFI_PAYER_PIX_KEY!;
const baseUrl = process.env.EFI_BASE_URL || "https://pix.api.efipay.com.br";
const clientId = process.env.EFI_CLIENT_ID!;
const clientSecret = process.env.EFI_CLIENT_SECRET!;
const certPath = process.env.EFI_CERT_P12_PATH!;
const certPassword = process.env.EFI_CERT_PASSWORD || "";

// 🔹 URL do webhook (Vercel)
const webhookUrl = process.env.WEBHOOK_URL || "https://ziller.club/api/efi/webhook";

// 🔹 Validações
if (!payerKey) throw new Error("❌ EFI_PAYER_PIX_KEY não definida no .env");
if (!clientId || !clientSecret) throw new Error("❌ EFI_CLIENT_ID ou EFI_CLIENT_SECRET não definidos no .env");
if (!fs.existsSync(certPath)) throw new Error(`❌ Certificado P12 não encontrado em: ${certPath}`);

// 🔹 Carrega certificado P12
const pfxBuffer = fs.readFileSync(certPath);
console.log("✅ Certificado carregado:", pfxBuffer.length, "bytes");

// 🔹 HTTPS Agent com mTLS
const httpsAgent = new https.Agent({
  pfx: pfxBuffer,
  passphrase: certPassword || undefined,
});

// 🔹 Interface do token OAuth
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

async function registerWebhook() {
  try {
    console.log("🔹 Obtendo token OAuth...");
    const tokenResp = await axios.post(`${baseUrl}/oauth/token`,
      "grant_type=client_credentials&scope=pix.webhook.write",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
        auth: { username: clientId, password: clientSecret },
      }
    );

    const accessToken = (tokenResp.data as TokenResponse).access_token;
    console.log("✅ Token obtido:", accessToken.substring(0, 10) + "...");

    console.log(`🔹 Registrando webhook na Efí: ${webhookUrl}`);
    const registerResp = await axios.put(
      `${baseUrl}/v2/webhook/${payerKey}`,
      { webhookUrl },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        httpsAgent,
        validateStatus: () => true, // evita crash em 400/308
      }
    );

    console.log("✅ Webhook registrado. Status:", registerResp.status);
    console.log(registerResp.data);

  } catch (err: any) {
    console.error("❌ Erro ao registrar webhook:", err.response?.data || err.message);
  }
}

registerWebhook();
