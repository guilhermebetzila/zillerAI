// app/api/efipay/saque/route.js
import 'dotenv/config';
import fs from "fs";
import https from "https";
import axios from "axios";
import forge from "node-forge";

// Caminho do certificado P12
const p12Path = process.env.EFI_CERT_P12_PATH;
if (!p12Path) throw new Error("❌ EFI_CERT_P12_PATH não definido no .env");

// Carregar P12
const p12Buffer = fs.readFileSync(p12Path);
const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.EFI_CERT_PASSWORD || "");

// Extrair chave privada
const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
if (!keyBags || keyBags.length === 0) throw new Error("❌ Nenhuma chave privada encontrada no P12");
const privateKeyPem = forge.pki.privateKeyToPem(keyBags[0].key);

// Extrair certificado
const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
const certPem = forge.pki.certificateToPem(certObj.cert);

// HTTPS Agent
const httpsAgent = new https.Agent({
  cert: certPem,
  key: privateKeyPem,
  rejectUnauthorized: false, // ⚠️ true em produção
});

// Basic Auth
const basicAuth = Buffer.from(`${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`).toString("base64");

// Função para gerar token
async function getToken() {
  const response = await axios.post(
    `${process.env.EFI_BASE_URL}/oauth/token`,
    new URLSearchParams({ grant_type: "client_credentials", scope: "pix.write pix.read" }).toString(),
    {
      httpsAgent,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basicAuth}`,
      },
    }
  );
  return response.data.access_token;
}

// Handler POST (somente PIX)
export async function POST(req) {
  try {
    const { userId, valor, chavePix } = await req.json();

    if (!userId || !valor || !chavePix) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400 });
    }

    const token = await getToken();

    // Dados do saque PIX
    const url = `${process.env.EFI_BASE_URL}/pix/saques`;
    const body = {
      valor,
      chave: chavePix,
      descricao: `Saque usuário ${userId}`,
    };

    const saqueRes = await axios.post(url, body, {
      httpsAgent,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    return new Response(JSON.stringify({
      txId: saqueRes.data.txId || null,
      status: saqueRes.data.status || "PENDING",
    }), { status: 200 });

  } catch (err) {
    console.error("❌ Erro no saque PIX:", err.response?.data || err.message);
    return new Response(JSON.stringify({ error: err.response?.data?.error || "Erro ao processar saque PIX" }), { status: 500 });
  }
}
