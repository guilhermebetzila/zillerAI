// app/api/efipay/saque.js
import 'dotenv/config';
import fs from "fs";
import https from "https";
import axios from "axios";
import forge from "node-forge";

// Carregar certificado P12
const p12Path = process.env.EFI_CERT_P12_PATH;
if (!p12Path) throw new Error("❌ EFI_CERT_P12_PATH não definido no .env");

const p12Buffer = fs.readFileSync(p12Path);
const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.EFI_CERT_PASSWORD || "");

// Extrair chave privada
const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
if (!keyBags || keyBags.length === 0) throw new Error("❌ Nenhuma chave privada encontrada no P12. Verifique a senha.");
const privateKeyPem = forge.pki.privateKeyToPem(keyBags[0].key);

// Extrair certificado
const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
const certPem = forge.pki.certificateToPem(certObj.cert);

// HTTPS agent
const httpsAgent = new https.Agent({
  cert: certPem,
  key: privateKeyPem,
  rejectUnauthorized: false, // ⚠️ true em produção
});

// Basic Auth header
const basicAuth = Buffer.from(`${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`).toString("base64");

// Função para gerar token
async function getToken() {
  try {
    const response = await axios.post(
      `${process.env.EFI_BASE_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        scope: "pix.write pix.read" // escopos para saque PIX
      }).toString(),
      {
        httpsAgent,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`
        },
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error("❌ Erro ao gerar token:", err.response?.data || err.message);
    throw new Error("Falha ao gerar token Efipay");
  }
}

// Função principal de saque
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { userId, valor, metodo, chavePix, carteiraUsdt } = req.body;

  if (!userId || !valor || !metodo) {
    return res.status(400).json({ error: "Parâmetros inválidos" });
  }

  try {
    const token = await getToken();

    // Configura dados do saque
    let body;
    let url;

    if (metodo === "PIX") {
      if (!chavePix) return res.status(400).json({ error: "Chave PIX é obrigatória" });

      url = `${process.env.EFI_BASE_URL}/pix/saques`;
      body = {
        valor,
        chave: chavePix,
        descricao: `Saque usuário ${userId}`,
      };
    } else if (metodo === "USDT") {
      if (!carteiraUsdt) return res.status(400).json({ error: "Carteira USDT é obrigatória" });

      url = `${process.env.EFI_BASE_URL}/usdt/saques`; // Ajuste para endpoint real USDT
      body = {
        valor,
        carteira: carteiraUsdt,
        descricao: `Saque usuário ${userId}`,
      };
    } else {
      return res.status(400).json({ error: "Método de saque inválido" });
    }

    // Requisição para Efipay
    const saqueRes = await axios.post(url, body, {
      httpsAgent,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Retorna sucesso
    return res.status(200).json({
      txId: saqueRes.data.txId || null,
      status: saqueRes.data.status || "PENDING",
    });

  } catch (err) {
    console.error("❌ Erro no saque:", err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data?.error || "Erro ao processar saque" });
  }
}
