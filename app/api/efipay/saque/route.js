import { NextResponse } from "next/server";
import https from "https";
import axios from "axios";
import forge from "node-forge";
import fs from "fs";

// ========== FUNÇÃO PARA PEGAR O CERTIFICADO ==========
function getCertBuffer() {
  if (process.env.EFI_CERT_P12_BASE64) {
    // 🔹 Ambiente de produção (Vercel)
    return Buffer.from(process.env.EFI_CERT_P12_BASE64, "base64");
  }

  if (process.env.EFI_CERT_P12_PATH) {
    // 🔹 Ambiente local (seu PC)
    return fs.readFileSync(process.env.EFI_CERT_P12_PATH);
  }

  throw new Error("Certificado não configurado");
}

// ========== FUNÇÃO PARA GERAR TOKEN ==========
async function gerarToken() {
  const p12Buffer = getCertBuffer();

  const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
  const p12 = forge.pkcs12.pkcs12FromAsn1(
    p12Asn1,
    process.env.EFI_CERT_PASSWORD || ""
  );

  const keyObj =
    p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
      forge.pki.oids.pkcs8ShroudedKeyBag
    ][0].key;
  const certObj =
    p12.getBags({ bagType: forge.pki.oids.certBag })[
      forge.pki.oids.certBag
    ][0].cert;

  const privateKeyPem = forge.pki.privateKeyToPem(keyObj);
  const certificatePem = forge.pki.certificateToPem(certObj);

  const httpsAgent = new https.Agent({
    pfx: p12Buffer,
    passphrase: process.env.EFI_CERT_PASSWORD || "",
    rejectUnauthorized: false,
  });

  const tokenResponse = await axios.post(
    `${process.env.EFI_BASE_URL}/oauth/token`,
    {
      grant_type: "client_credentials",
    },
    {
      auth: {
        username: process.env.EFI_CLIENT_ID,
        password: process.env.EFI_CLIENT_SECRET,
      },
      httpsAgent,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("🔑 Token gerado:", tokenResponse.data?.access_token);

  return {
    token: tokenResponse.data?.access_token,
    httpsAgent,
  };
}

// ========== ENDPOINT DE SAQUE ==========
export async function POST(req) {
  try {
    const body = await req.json();
    const { valor, chavePix, userId } = body;

    if (!valor || !chavePix) {
      return NextResponse.json(
        { error: "Valor e chave PIX são obrigatórios" },
        { status: 400 }
      );
    }

    const { token, httpsAgent } = await gerarToken();

    const payload = {
      valor: Number(valor).toFixed(2), // string formatada
      favorecido: {
        chave: chavePix,
      },
      infoPagador: `Saque do usuário ${userId || "N/A"}`,
    };

    console.log("🌐 URL PIX Saque:", `${process.env.EFI_BASE_URL}/v2/pix/envio`);
    console.log("📦 Payload PIX Saque:", payload);

    const saqueRes = await axios.post(
      `${process.env.EFI_BASE_URL}/v2/pix/envio`,
      payload,
      {
        httpsAgent,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Saque PIX enviado:", saqueRes.data);

    return NextResponse.json({
      success: true,
      data: saqueRes.data,
    });
  } catch (error) {
    console.error(
      "❌ Erro no saque PIX:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      {
        error: "Erro ao processar saque PIX",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
