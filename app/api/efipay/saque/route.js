import https from "https";
import axios from "axios";
import forge from "node-forge";

// Decodificar P12 do ENV
const p12Base64 = process.env.EFI_CERT_P12_BASE64;
if (!p12Base64) throw new Error("❌ EFI_CERT_P12_BASE64 não definido");

const p12Der = forge.util.decode64(p12Base64);
const p12Asn1 = forge.asn1.fromDer(p12Der);
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.EFI_CERT_PASSWORD || "");

// Extrair chave privada
const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
if (!keyBags || keyBags.length === 0) throw new Error("❌ Nenhuma chave privada encontrada no P12");
const privateKeyPem = forge.pki.privateKeyToPem(keyBags[0].key);

// Extrair certificado
const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
const certPem = forge.pki.certificateToPem(certObj.cert);

// Configurar HTTPS Agent
const httpsAgent = new https.Agent({
  cert: certPem,
  key: privateKeyPem,
  rejectUnauthorized: false, // ⚠️ true em produção
});

// Basic Auth
const basicAuth = Buffer.from(`${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`).toString("base64");

// Função para gerar token
async function getToken() {
  try {
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
  } catch (err) {
    console.error("❌ Erro ao gerar token Efipay:", err.response?.data || err.message);
    throw new Error("Erro ao gerar token Efipay");
  }
}

// Handler POST
export async function POST(req) {
  try {
    const { userId, valor, chavePix } = await req.json();

    if (!userId || !valor || !chavePix) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400 });
    }

    const token = await getToken();
    console.log("🔑 Token gerado:", token);

    // Rota oficial de saque PIX
    const url = `${process.env.EFI_BASE_URL}/pix/saques`;
    console.log("🌐 URL PIX Saque:", url);

    const saqueRes = await axios.post(
      url,
      {
        valor,
        chave: chavePix,
        descricao: `Saque usuário ${userId}`,
      },
      {
        httpsAgent,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }
    );

    console.log("✅ Resposta PIX:", saqueRes.data);

    return new Response(JSON.stringify({
      txId: saqueRes.data.txId || null,
      status: saqueRes.data.status || "PENDING",
    }), { status: 200 });

  } catch (err) {
    console.error("❌ Erro no saque PIX:", err.response?.data || err.message);
    return new Response(JSON.stringify({ error: err.response?.data?.error || "Erro ao processar saque PIX" }), { status: 500 });
  }
}
