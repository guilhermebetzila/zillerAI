import fs from "fs";
import https from "https";
import axios from "axios";

// 🔹 Configurações do webhook
const urlWebhook = "https://ziller.club/api/efi/webhook"; // sem query string para teste
const chavePix = process.env.EFI_PAYER_PIX_KEY || "";
const baseUrl = process.env.EFI_BASE_URL || "https://pix.api.efipay.com.br";
const clientId = process.env.EFI_CLIENT_ID || "";
const clientSecret = process.env.EFI_CLIENT_SECRET || "";
const certBase64 = (process.env.EFI_CERT_P12_BASE64 || "").replace(/\\n/g, "\n");
const certPassword = process.env.EFI_CERT_PASSWORD || "";

// 🔹 Converter Base64 do .p12 para buffer
const pfxBuffer = Buffer.from(certBase64, "base64");

// 🔹 Criar agente HTTPS com mTLS
const httpsAgent = new https.Agent({
  pfx: pfxBuffer,
  passphrase: certPassword,
});

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

async function registerWebhook() {
  try {
    if (!chavePix) throw new Error("🚨 EFI_PAYER_PIX_KEY não definida no .env");
    if (!clientId || !clientSecret) throw new Error("🚨 EFI_CLIENT_ID ou EFI_CLIENT_SECRET não definidos no .env");

    console.log("Obtendo token OAuth...");

    // 1️⃣ Obter token OAuth via mTLS
    const tokenResp = await axios.post<TokenResponse>(
      `${baseUrl}/oauth/token`,
      "grant_type=client_credentials&scope=pix.webhook.write",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        httpsAgent,
        auth: { username: clientId, password: clientSecret },
      }
    );

    const accessToken = tokenResp.data.access_token;
    if (!accessToken) throw new Error("Não foi possível obter access token");

    console.log("Token obtido com sucesso:", accessToken.substring(0, 10) + "...");

    // 2️⃣ Registrar webhook com skip-mTLS
    console.log("Registrando webhook...");

    const registerResp = await axios.put(
      `${baseUrl}/v2/webhook/${chavePix}`,
      { url: urlWebhook },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-skip-mtls-checking": "true",
        },
        httpsAgent,
      }
    );

    console.log("✅ Webhook registrado com sucesso:", registerResp.data);

  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("Erro Axios:", err.response?.data || err.message);
    } else if (err instanceof Error) {
      console.error("Erro:", err.message);
    } else {
      console.error("Erro desconhecido:", err);
    }
  }
}

registerWebhook();
