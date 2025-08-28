// app/api/efipay/get-token.js

import 'dotenv/config'; // carrega variáveis do .env
import fs from "fs";
import https from "https";
import axios from "axios";
import forge from "node-forge";

// Validar se o caminho do certificado está definido
const p12Path = process.env.EFI_CERT_P12_PATH;
if (!p12Path) throw new Error("❌ EFI_CERT_P12_PATH não definido no .env");

// Carregar certificado P12
const p12Buffer = fs.readFileSync(p12Path);
const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, process.env.EFI_CERT_PASSWORD || "");

// Extrair chave privada (corrigido para pkcs8ShroudedKeyBag)
const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
if (!keyBags || keyBags.length === 0) throw new Error("❌ Nenhuma chave privada encontrada no P12. Verifique a senha.");
const privateKeyPem = forge.pki.privateKeyToPem(keyBags[0].key);

// Extrair certificado
const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
const certPem = forge.pki.certificateToPem(certObj.cert);

// Configurar HTTPS agent
const httpsAgent = new https.Agent({
  cert: certPem,
  key: privateKeyPem,
  rejectUnauthorized: false, // em produção coloque true
});

async function getToken() {
  try {
    const response = await axios.post(
      `${process.env.EFI_BASE_URL}/oauth/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.EFI_CLIENT_ID,
        client_secret: process.env.EFI_CLIENT_SECRET,
      }).toString(),
      {
        httpsAgent,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("✅ Token gerado com sucesso:");
    console.log(response.data.access_token);
  } catch (error) {
    console.error("❌ Erro ao gerar token:");
    console.error(error.response?.data || error.message);
  }
}

// Executar função
getToken();
