import "dotenv/config";
import https from "https";
import fs from "fs";
import axios from "axios";

// 🔹 Variáveis do .env
const payerKey: string = process.env.EFI_PAYER_PIX_KEY as string;
const baseUrl: string = process.env.EFI_BASE_URL || "https://pix.api.efipay.com.br";
const clientId: string = process.env.EFI_CLIENT_ID as string;
const clientSecret: string = process.env.EFI_CLIENT_SECRET as string;
const certPath: string = process.env.EFI_CERT_P12_PATH as string;
const certPassword: string = process.env.EFI_CERT_PASSWORD || "";

// 🔹 URL final do webhook (sem barra no fim!)
const webhookUrl: string = "https://77c67721417f.ngrok-free.app/api/efi/webhook";

// 🔹 Valida variáveis essenciais
if (!payerKey) throw new Error("❌ EFI_PAYER_PIX_KEY não definida no .env");
if (!clientId || !clientSecret) throw new Error("❌ EFI_CLIENT_ID ou EFI_CLIENT_SECRET não definidos no .env");
if (!fs.existsSync(certPath)) throw new Error(`❌ Certificado P12 não encontrado em: ${certPath}`);

// 🔹 Carrega certificado P12
const pfxBuffer = fs.readFileSync(certPath);
console.log("✅ Certificado carregado:", pfxBuffer.length, "bytes");

// 🔹 Cria HTTPS Agent com mTLS
const httpsAgent = new https.Agent({
  pfx: pfxBuffer,
  passphrase: certPassword || undefined,
});
console.log("✅ HTTPS Agent criado");

// 🔹 Interface do token OAuth
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// 🔹 Função principal
async function registerWebhook() {
  try {
    console.log("🔹 Obtendo token OAuth...");

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
    if (!accessToken) throw new Error("❌ Não foi possível obter access token");
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
        validateStatus: (status) => status < 500, // mostra erros sem crash
      }
    );

    console.log("✅ Webhook registrado. Resposta completa:");
    console.log(registerResp.status, registerResp.data);

  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Erro Axios:");
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
      console.error("Mensagem:", err.message);
    } else {
      console.error("❌ Erro:", err.message || err);
    }
  }
}

registerWebhook();

